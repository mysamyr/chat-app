const rooms = [];

const addToRoom = (room) => {
  const roomIdx = rooms.findIndex((r) => r.name === room);

  if (roomIdx !== -1) {
    rooms[roomIdx].count++;
    return rooms;
  }

  const newRoom = { name: room, count: 1 };

  rooms.push(newRoom);
  return newRoom;
};

const removeFromRoom = (room) => {
  const roomIdx = rooms.findIndex((r) => r.name === room);

  if (roomIdx === -1) {
    return {error: "Not existing room"};
  }

  rooms[roomIdx].count--;

  if (rooms[roomIdx].count === 0) {
    return rooms.splice(roomIdx, 1)[0];
  }
};
// limit to 5
const getRooms = () => rooms.filter((r, i) => i <= 6);

module.exports = {
  addToRoom,
  removeFromRoom,
  getRooms
}