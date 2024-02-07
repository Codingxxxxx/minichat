// contains sockets of connected users
const sockets = new Map();

/**
 * store socket to array
 * @param {string} userId 
 * @param {import('socket.io').Socket} socket 
 */
function storeSocket(userId, socket) {
  const s = sockets.get(userId) || [];
  s.push(socket);
}

/**
 * store socket to array
 * @param {string} userId 
 * @param {import('socket.io').Socket} socket 
 */
function removeSocket(userId, socket) {
  const s = sockets.get(userId) || [];
  const idx = s.indexOf(s => s === socket);
  s.splice(idx, 1);
}

/**
 * 
 * @param {string} userId 
 * @param {import('socket.io').Socket} socket 
 * @returns {import('socket.io').Socket}
 */
function findSocket(userId, socket) {
  const s = sockets.get(userId) || [];
  return s.find((val) => val === socket);
}

/**
 * 
 * @param {string} userId 
 * @returns {Array<import('socket.io').Socket>}
 */
function findAllSockets(userId) {
  return sockets.get(userId) || []
}

/**
 * 
 * @returns {Map<string, import('socket.io').Socket>}
 */
function getSockets() {
  return sockets;
}

module.exports = {
  findSocket,
  storeSocket,
  removeSocket,
  findAllSockets,
  getSockets
}