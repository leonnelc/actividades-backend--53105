const socket = io();

const chatInput = document.getElementById("chat-input");
const message = document.getElementById("message");
const chatMessages = document.getElementById("chat-messages");
let currentUser;
socket.emit("chat:join");
socket.on("chat:success", () => {
  console.log("Joined chat succesfully");
  appendAlert("Joined chat", "success", 2500);
  socket.emit("getUser");
});
socket.on("user", (user) => {
  currentUser = user;
  checkMessages();
});
function checkMessages() {
  // iterates every message to check if it can be deleted
  // if the message can be deleted then it adds a delete button to the message
  for (let msg of document.getElementsByClassName("message")) {
    const username = msg.getAttribute("data-user");
    if (!canDeleteMessage(username)) {
      continue;
    }
    const contentElement = msg.querySelector(".message-content");
    const deleteButton = document.createElement("span");
    deleteButton.onclick = () => {
      socket.emit("chat:deleteMessage", msg.id);
    };
    const deleteBtnIcon = document.createElement("i");
    deleteBtnIcon.classList.add("bi", "bi-trash");
    deleteButton.appendChild(deleteBtnIcon);
    contentElement.appendChild(deleteButton);
  }
}

chatInput.addEventListener("keyup", (event) => {
  if (event.key == "Enter") {
    sendMessage();
  }
});
function sendMessage() {
  let msg = message.value.trim();
  message.value = "";
  socket.emit("chat:message", msg);
}
function canDeleteMessage(user) {
  if (user === currentUser?.email || currentUser?.role === "admin") {
    return true;
  }
  return false;
}
function addMessage(username, message, id) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.setAttribute("id", id);
  messageElement.setAttribute("data-user", username);
  const userElement = document.createElement("div");
  userElement.classList.add("message-user");

  const usernameSpan = document.createElement("span");
  usernameSpan.classList.add("message-username");
  usernameSpan.textContent = username;

  const contentElement = document.createElement("div");
  contentElement.classList.add("message-content");

  const messageParagraph = document.createElement("p");
  messageParagraph.textContent = message;

  const deleteButton = document.createElement("span");
  deleteButton.onclick = () => {
    socket.emit("chat:deleteMessage", id);
  };
  const deleteBtnIcon = document.createElement("i");
  deleteBtnIcon.classList.add("bi", "bi-trash");
  deleteButton.appendChild(deleteBtnIcon);
  contentElement.appendChild(messageParagraph);
  if (canDeleteMessage(username)) contentElement.appendChild(deleteButton);
  userElement.appendChild(usernameSpan);
  messageElement.appendChild(userElement);
  messageElement.appendChild(contentElement);
  chatMessages.appendChild(messageElement);
}

socket.on("error", (error) => {
  appendAlert(error, "danger", 2500);
});

socket.on("chat:message", (message) => {
  let user = message.user;
  let text = message.message;
  let scrollableHeight = chatMessages.scrollHeight - chatMessages.clientHeight;
  let scroll = chatMessages.scrollTop == scrollableHeight;
  addMessage(user, text, message.id);
  if (scroll) {
    chatMessages.scrollTop =
      chatMessages.scrollHeight - chatMessages.clientHeight;
  }
});
socket.on("chat:deleteMessage", (id) => {
  const messageElement = document.getElementById(id);
  messageElement.remove();
});
// utility function that waits and can be cancelled with sleep.abort()
// useful when using with a promise that uses sleep.abort() as a callback
const sleep = (ms) => {
  let resolver;
  let timeoutId;
  const promise = new Promise((resolve) => {
    timeoutId = setTimeout(resolve, ms);
    resolver = resolve;
  });
  promise.abort = (reason = undefined) => {
    clearTimeout(timeoutId);
    resolver(reason);
  };
  return promise;
};
