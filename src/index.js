const path = require("path");
const http = require("http");
const express = require("express");
const {Server} = require("socket.io");
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
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

// socket.emit, io.emit, socket.broadcast.emit
// io.to.emit, socket.broadcast.to.emit

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  socket.on("join", ({ username, room }, callback) => {
    if (username.length > 12) return callback("Username must be maximum 12 character long");
    if (room.length > 20) return callback("Room name is too long. Maximum 20 characters");

    const {error, user} = addUser({id: socket.id, username, room});

    if (error) return callback(error);

    socket.join(user.room);
    addToRoom(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on("currentRooms", (callback) => {
    callback(getRooms());
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('locationMessage', generateLocationMessage(
      user.username,
      `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left!`));
      io.to(user.room).emit("roomData", {
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