const { Logger } = require('../libs');
const { UserService } = require('../services');
const { findAllSockets } = require('./sockets.ws');
const { ChatSeverEvent } = require('../const').WSEvent;

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

  socket.on(ChatSeverEvent.JOIN_ROOM, ({ otherUserId }) => {
    const roomId = createRoomId(userId, otherUserId);
    socket.join(roomId);
    socket.emit(ChatSeverEvent.JOIN_ROOM, { roomId, otherUserId });
  })

  socket.on(ChatSeverEvent.FRIEND_REQUEST, (payload) => {
    onFriendRequest(socket, payload);
  });
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
 * @param {import('socket.io').Socket} from 
 * @param {Object} payload 
 * @param {boolean} payload.isOnline
 */
async function onUserOnlineStatusChange(from, payload) {
  try {
    
    const userId = from.request.user.userId;
    await UserService.updateOnlineStatus(userId, payload.isOnline);
  } catch (error) {
    Logger.error('event ' + ChatSeverEvent.USER_ONLINE_STATUS)
  }
}

module.exports = {
  initChat
}