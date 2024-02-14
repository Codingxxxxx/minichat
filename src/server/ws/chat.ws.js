const { Logger } = require('../libs');
const { UserService } = require('../services');
const { findAllSockets, removeSocket } = require('./sockets.ws');
const { ChatSeverEvent } = require('../const').WSEvent;
const { storeRoom, findRooms, removeRoom, removeAllRooms } = require('./rooms.ws');
const { FriendRequestStatus } = require('../const').DB;

/**
 * Create room id
 * @param {string} id1 
 * @param {string} id2 
 * @returns {string}
 */
function createRoomId(id1, id2) {
  return `/chat/private/${[id1, id2].sort().join('-')}`;
}

/**
 * Create friend request room
 * @param {string} id1 
 * @param {string} id2 
 * @returns {string}
 */
function createFriendRequestRoomId(id1, id2) {
  return `/chat/friend-request/${[id1, id2].sort().join('-')}`;
}

/**
 * initialize chat ws
 * @param {import('socket.io').Socket} socket 
 * @param {import('socket.io').Server} io
 */
async function initChat(socket, io) {
  const userId = socket.request.user.userId;
  await UserService.updateOnlineStatus(userId, true);

  socket.on('disconnecting', () => {
    onDisconnect(socket, userId);
  });

  // join private chat room
  socket.on(ChatSeverEvent.JOIN_ROOM, ({ otherUserId }) => {
    onJoinRoom(socket, { currentUserId: userId, otherUserId });
  })
  
  // friend request
  socket.on(ChatSeverEvent.FRIEND_REQUEST, (payload) => {
    onFriendRequest(socket, payload);
  })

  // friend request actions, rejected or approved
  socket.on(ChatSeverEvent.FRIEND_REQUEST_ACTION, (payload) => {
    onFriendRequestAction(
      socket, 
      { 
        currentUserId: userId, 
        otherUserId: payload.otherUserId,
        accepted: payload.accepted
      }
    )
  })
}

/**
 * handle on socket disconnecting
 * @param {import('socket.io').Socket} socket 
 */
async function onDisconnect(socket, userId) {
  try { 
    // remove socket 
    removeSocket(userId, socket);

    if (findAllSockets(userId).length === 0) {
      await UserService.updateOnlineStatus(userId, false);
      findRooms(userId).forEach(r => {
        socket.to(r).emit(ChatSeverEvent.USER_ONLINE_STATUS, { userId, isOnline: false });
      });
      removeAllRooms(userId);
    }
  } catch (error) {
    Logger.error('event ' + 'disconnecting', error);
  }
}

/**
 * event of friend request
 * @param {import('socket.io').Socket} from
 * @param {Object} payload
 * @param {string} payload.to
 * @param {Promise<void>}
 */
async function onFriendRequest(from, payload) {
  try {
    const { userId, username } = from.request.user;

    // check if friend request is already sent, user can't send requst multiple times 
    // if they are already send once
    // the users can submit friend requests again when other users approved or rejected the requests.
    const user = await UserService.getPendingFriendRequestByStatus(userId, { friendId: payload.to, status: FriendRequestStatus.PENDING});
    
    if (user && user.pendingFriendRequests.length > 0) return Logger.warn(`Event: ${ChatSeverEvent.FRIEND_REQUEST} Can not sent friend request twice.`);

    // create room id
    const friendRequestRoomId = createFriendRequestRoomId(userId, payload.to);

    // join roomm
    // reciever 
    findAllSockets(payload.to).forEach(s => s.join(friendRequestRoomId));

    await Promise.all([
      UserService.addFriendRequest(payload.to, { from: userId }),
      UserService.addPendingFriendRequest(userId, { to: payload.to })
    ])
    
    // broadcast to all joined privat chat rooms
    from.to(friendRequestRoomId).emit(ChatSeverEvent.FRIEND_REQUEST, { username });
  } catch (error) {
    Logger.error('event ' + ChatSeverEvent.FRIEND_REQUEST, error);
  }
}

/**
 * 
 * @param {import('socket.io').Socket} socket 
 * @param {Object} payload
 * @param {string} payload.otherUserId
 * @param {string} payload.currentUserId 
 */
function onJoinRoom(socket, { otherUserId, currentUserId }) {
  const roomId = createRoomId(currentUserId, otherUserId);
  socket.join(roomId);
  storeRoom(currentUserId, roomId);
  // notify online status
  socket.to(roomId).emit(ChatSeverEvent.USER_ONLINE_STATUS, { userId: currentUserId, isOnline: true });
}

/**
 * 
 * @param {import('socket.io').Socket} socket 
 * @param {Object} friendRequestAction
 * @param {string} friendRequestAction.otherUserId
 * @param {string} friendRequestAction.currentUserId
 * @param {boolean} friendRequestAction.accepted
 */
async function onFriendRequestAction(socket, { otherUserId, currentUserId, accepted }) {
  try {
    // check if has friend request
    if (!await UserService.getFriendRequestByStatus(currentUserId, { from: otherUserId, status: FriendRequestStatus.PENDING })) return;
    
    const friendRequestRoomId = createFriendRequestRoomId(currentUserId, otherUserId);
    const privateRoomId = createRoomId(currentUserId, otherUserId);

    if (accepted) {
      await Promise.all([
        UserService.addFriend(currentUserId, { friendId: otherUserId }),
        UserService.addFriend(otherUserId, { friendId: currentUserId })
      ])

      socket.join(privateRoomId, friendRequestRoomId);
      findAllSockets(otherUserId).forEach(s => s.join(privateRoomId, friendRequestRoomId));
    } else {
      socket.join(friendRequestRoomId);
      findAllSockets(otherUserId).forEach(s => s.join(friendRequestRoomId));
    }

    await Promise.all([
      UserService.updateFriendRequestStatus(currentUserId, { friendId: otherUserId, status: accepted ? FriendRequestStatus.APPROVED : FriendRequestStatus.REJECTED }),
      UserService.updatePendingFriendRequestStatus(otherUserId, { to: currentUserId, status: accepted ? FriendRequestStatus.APPROVED : FriendRequestStatus.REJECTED })
    ])

    socket.to(friendRequestRoomId).emit(ChatSeverEvent.FRIEND_REQUEST_ACTION, { userId: currentUserId });
  } catch (error) {
    console.error(error);
    Logger.error('event ' + ChatSeverEvent.FRIEND_REQUEST_ACTION, error);
  }
}

module.exports = {
  initChat
}