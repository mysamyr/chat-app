const users = [];

const addUser = ({id, username, room}) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username) {
    return {
      error: 'Username is required!'
    };
  }
  if (!room) {
    return {
      error: 'Room is required!'
    };
  }
  if (username.length > 14) {
    return {
      error: "Username is too long. Maximum 12 characters."
    };
  }
  if (room.length > 14) {
    return {
      error: "Room name is too long. Maximum 14 characters."
    };
  }

  const existingUser = users.find((user) => user.room === room && user.username === username);
  if (existingUser) {
    return {
      error: 'Username is in use!'
    };
  }

  const user = {id, username, room};
  users.push(user);
  return {user};
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find(user => user.id === id);

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();

  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
