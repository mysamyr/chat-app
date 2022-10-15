const path = require("path");
const http = require("http");
const express = require("express");
const {Server} = require("socket.io");
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");
const {
  addToRoom,
  removeFromRoom,
  getRooms
} = require("./utils/rooms");
const {
  CONNECTION,
  JOIN,
  MESSAGE,
  ROOM_DATA,
  CURRENT_ROOMS,
  SEND_MESSAGE,
  SEND_LOCATION,
  LOCATION_MESSAGE,
  DISCONNECT
} = require("./constants/events");

// socket.emit, io.emit, socket.broadcast.emit
// io.to.emit, socket.broadcast.to.emit

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on(CONNECTION, socket => {
  socket.on(JOIN, ({username, room}, callback) => {
    const {error, user} = addUser({id: socket.id, username, room});

    if (error) return callback(error);

    socket.join(user.room);
    addToRoom(user.room);

    socket.emit(MESSAGE, generateMessage("Admin", "Welcome!"));
    socket.broadcast.to(user.room).emit(MESSAGE, generateMessage("Admin", `${user.username} has joined!`));

    io.to(user.room).emit(ROOM_DATA, {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on(CURRENT_ROOMS, (callback) => {
    callback(getRooms());
  });

  socket.on(SEND_MESSAGE, (message, callback) => {
    const user = getUser(socket.id);

    if (!user) {
      return callback("User not found");
    }

    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.to(user.room).emit(MESSAGE, generateMessage(user.username, message));
    callback();
  });

  socket.on(SEND_LOCATION, (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(LOCATION_MESSAGE, generateLocationMessage(
      user.username,
      `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));

    callback();
  });

  socket.on(DISCONNECT, () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(MESSAGE, generateMessage("Admin", `${user.username} has left!`));
      io.to(user.room).emit(ROOM_DATA, {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
      removeFromRoom(user.room);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});