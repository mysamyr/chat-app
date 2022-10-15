const socket = io();

const $messageForm = document.querySelector("#message-form"),
  $messageFormInput = $messageForm.querySelector("input"),
  $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;
  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  // Visible height
  const visibleHeight = $messages.offsetHeight;
  // Height of messages container
  const containerHeight = $messages.scrollHeight;
  // How far have I scroll?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = containerHeight;
  }
};
const scrollToEnd = () => {
  $messages.scrollTop = $messages.scrollHeight
};
const isURL = (msg) => {
  const url = /^(https?:\/\/(www.)?|www.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    if (url.test(msg)) {
      return `<a href="${msg}" target="_blank">${msg}</a>`;
    }
    return `<p>${msg}</p>`;
};

socket.on("message", message => {
  message.text = isURL(message.text);

  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", message => {
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on("roomData", ({room, users}) => {
  document.querySelector("#sidebar").innerHTML = Mustache.render(sidebarTemplate, {
    room,
    users
  });
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, err => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    scrollToEnd();
    if (err) return console.log(err);
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) return alert("Geolocation is not supported by your browser");

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    const coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    socket.emit("sendLocation", coordinates, () => {
      $sendLocationButton.removeAttribute("disabled");
    });
  });
});

socket.emit('join', {username, room}, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

window.addEventListener("scroll", () => {
  if (document.documentElement.scrollTop > 1) {
    document.body.prepend(btn);
    btn.classList.add("show");
  } else {
    btn.classList.remove("show");
  }
});
