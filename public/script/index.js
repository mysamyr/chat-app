const socket = io();

const $rooms = document.querySelector("#rooms");
const $noRoomsTemplate = document.querySelector("#no-rooms-template").innerHTML;
const $existingRoomsTemplate = document.querySelector("#rooms-template").innerHTML;

socket.emit("currentRooms", rooms => {
  if (!rooms.length) {
    $rooms.innerHTML = $noRoomsTemplate;
  } else {
    const html = Mustache.render($existingRoomsTemplate, {
      rooms
    });
    $rooms.insertAdjacentHTML("beforeend", html);
  }
});
