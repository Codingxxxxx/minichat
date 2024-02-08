const rooms = new Map();

function storeRoom(userId, roomId) {
  const r = rooms.get(userId) || [];
  r.push(roomId);
  rooms.set(userId, r);
}

function findRooms(userId) {
  // remove duplicate rooms
  return Array.from(new Set(rooms.get(userId) || []).values())
}

function removeRoom(userId, roomId) {
  const r = rooms.get(userId) || [];
  const idx = r.indexOf(roomId);
  if (idx !== -1) return;
  r.splice(idx, 1);
}

function removeAllRooms(userId) {
  rooms.set(userId, []);
}

module.exports = {
  storeRoom,
  findRooms,
  removeRoom,
  removeAllRooms
}