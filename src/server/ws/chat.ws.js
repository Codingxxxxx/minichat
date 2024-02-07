const { Logger } = require('../libs');
const { UserService } = require('../services');
const { ChatSeverEvent } = require('../const').WSEvent;
const { findAllSockets } = require('./sockets.ws');

/**
 * initialize chat ws
 * @param {import('socket.io').Socket} socket 
 * @param {Map<string, import('socket.io').Socket>} sockets
 */
async function initChat(socket) {
  socket.on(ChatSeverEvent.FRIEND_REQUEST, (payload) => {
    onFriendRequest(socket, payload)
  });
}

/**
 * event of friend request
 * @param {import('socket.io').Socket} from
 * @param {object} payload
 * @param {string} payload.to
 * @param {Promise<void>}
 */
async function onFriendRequest(from, payload) {
  try {
    const { userId } = from.request.user;
    const user = await UserService.getUserById(userId);
    findAllSockets(payload.to).forEach(s => s.emit(ChatSeverEvent.FRIEND_REQUEST, { username: user.username }))
  } catch (error) {
    Logger.error('event ' + ChatSeverEvent.FRIEND_REQUEST, error);
  }
}

module.exports = {
  initChat
}