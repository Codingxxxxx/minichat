const { Auth } = require('../libs');

/**
 * Check authentication of websocket 
 * @param {import('socket.io').Socket} socket 
 * @param {import('express').NextFunction} next 
 */
module.exports = async function(socket, next) {
  try {
    const token = socket.handshake.auth.token;
    const payload = await Auth.decodeJWT(token).catch(() => {
      throw new Error('Unauthorized')
    })

    socket.request.user = {
      userId: payload.userId,
      username: payload.username
    };

    next();
  } catch (error) {
    next(error);
  }
}