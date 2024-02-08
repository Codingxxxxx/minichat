const { Logger } = require('../libs');
const { UserService } = require('../services');
const { findAllSockets, removeSocket } = require('./sockets.ws');
const { ChatSeverEvent } = require('../const').WSEvent;
const { storeRoom, findRooms, removeRoom, removeAllRooms } = require('./rooms.ws');

function createRoomId(id1, id2) {
  return `/chat/private/${[id1, id2].sort().join('-')}`;
}

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
    const { userId } = from.request.user;
    // create room id
    const friendRequestRoomId = createFriendRequestRoomId(userId, payload.to);

    // join roomm
    // reciever 
    findAllSockets(payload.to).forEach(s => s.join(friendRequestRoomId));

    const [user] = await Promise.all([
      UserService.getUserById(userId),
      UserService.addFriendRequest(payload.to, { from: userId })
    ])
    
    from.to(friendRequestRoomId).emit(ChatSeverEvent.FRIEND_REQUEST, { username: user.username });
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

module.exports = {
  initChat
}