const { initChat } = require('./chat.ws');
const { checkWSAuth } = require('../middleware');
const { Logger } = require('../libs');
const { storeSocket, removeSocket, getSockets } = require('./sockets.ws');

/**
 * Initialize websocket
 * @param {import('socket.io').Server} io 
 * @param {import('express').Application} app 
 */
async function initWS(io, app) {
  const chatIO = io.of('/chat');
  chatIO.use(checkWSAuth);
  // check auth on chat
  chatIO.on('connection', onConnection);
}

/**
 * event on client socket connected
 * @param {import('socket.io').Socket} socket 
 */
async function onConnection(socket) {
  const userId = socket.request.user.userId;

  storeSocket(socket, userId);
  
  console.log(Object.fromEntries(getSockets().entries()))

  socket.on('disconnecting', () => {
    removeSocket(socket, userId);
  });

  initChat(socket);
}

module.exports = {
  initWS
};