const socket = io();

const chatInput = document.getElementById("chat-input");
const messageBox = document.getElementById("message");
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
  // iterates every message to check if it can be deleted or edited
  // if the message can be edited then it adds the buttons to the message
  for (let msg of document.getElementsByClassName("message")) {
    const username = msg.getAttribute("data-user");
    if (!canDeleteMessage(username)) {
      continue;
    }
    const contentElement = msg.querySelector(".message-content");
    const buttonContainer = document.createElement("span");

    const updateBtn = document.createElement("i");
    updateBtn.onclick = () => {
      socket.emit("chat:updateMessage", { id: msg.id, message: messageBox.value });
    };
    updateBtn.classList.add("bi", "bi-pencil");
    const deleteBtn = document.createElement("i");
    deleteBtn.onclick = () => {
      socket.emit("chat:deleteMessage", msg.id);
    };
    deleteBtn.classList.add("bi", "bi-trash");

    buttonContainer.appendChild(updateBtn);
    buttonContainer.appendChild(deleteBtn);
    //deleteButton.appendChild(deleteBtnIcon);
    //updateButton.appendChild(updateBtnIcon);
    //contentElement.appendChild(updateButton);
    //contentElement.appendChild(deleteButton);
    contentElement.appendChild(buttonContainer);
  }
}

chatInput.addEventListener("keyup", (event) => {
  if (event.key == "Enter") {
    sendMessage();
  }
});
function sendMessage() {
  let msg = messageBox.value.trim();
  messageBox.value = "";
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

  const buttonContainer = document.createElement("span");
  const updateBtn = document.createElement("i");
  updateBtn.onclick = () => {
    socket.emit("chat:updateMessage", { id, message: messageBox.value });
  };
  updateBtn.classList.add("bi", "bi-pencil");
  const deleteBtn = document.createElement("i");
  deleteBtn.onclick = () => {
    socket.emit("chat:deleteMessage", id);
  };
  deleteBtn.classList.add("bi", "bi-trash");

  buttonContainer.appendChild(updateBtn);
  buttonContainer.appendChild(deleteBtn);
  contentElement.appendChild(messageParagraph);
  if (canDeleteMessage(username)) contentElement.appendChild(buttonContainer);
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
socket.on("chat:updateMessage", ({ id, message }) => {
  const messageElement = document
    .getElementById(id)
    .querySelector(".message-content p");
  messageElement.textContent = message;
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
