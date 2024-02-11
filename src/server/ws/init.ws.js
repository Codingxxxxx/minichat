const { initChat } = require('./chat.ws');
const { checkWSAuth } = require('../middleware');
const { Logger } = require('../libs');
const { storeSocket, removeSocket } = require('./sockets.ws');

/**
 * Initialize websocket
 * @param {import('socket.io').Server} io 
 * @param {import('express').Application} app 
 */
async function initWS(io, app) {
  const chatIO = io.of('/chat');
  chatIO.use(checkWSAuth);
  // check auth on chat
  chatIO.on('connection', (socket) => {
    onConnection(socket, io);
  });
}

/**
 * event on client socket connected
 * @param {import('socket.io').Socket} socket 
 * @param {import('socket.io').Server} io
 */
async function onConnection(socket, io) {
  const userId = socket.request.user.userId;
  storeSocket(userId, socket);  
  socket.emit('ACCEPTED', { data: socket.request.user });

  initChat(socket, io);
}

module.exports = {
  initWS
};