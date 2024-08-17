const socket = io();

const chatInput = document.getElementById("chat-input");
const messageBox = document.getElementById("message");
const chatMessages = document.getElementById("chat-messages");
const editMessageModalElement = document.getElementById("editMessageModal");
const editMessageInput = document.getElementById("editMessageInput");
const editMessageForm = document.getElementById("editMessageForm");
let editMessageModal;
document.addEventListener("DOMContentLoaded", () => {
  editMessageModal = new bootstrap.Modal(editMessageModalElement);
})
editMessageModalElement.addEventListener("shown.bs.modal", () => {
  editMessageInput.focus();
})
editMessageForm.addEventListener("submit", handleSaveMessageInput);
let currentUser;
socket.emit("chat:join");
socket.on("chat:success", () => {
  console.log("Joined chat succesfully");
  appendAlert("Joined chat", "success", 2500);
  socket.emit("getUser");
});
socket.on("user", (user) => {
  if (currentUser) return;
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
    const textElement = contentElement.querySelector("p");
    const buttonContainer = msg.querySelector(".message-buttons");

    const updateBtn = document.createElement("i");
    updateBtn.onclick = () => {
      showEditMessageModal({ messageId:msg.id, messageContent:textElement.innerText })
    };
    updateBtn.classList.add("btn", "bi", "bi-pencil");
    const deleteBtn = document.createElement("i");
    deleteBtn.onclick = () => {
      socket.emit("chat:deleteMessage", msg.id);
    };
    deleteBtn.classList.add("btn", "bi", "bi-trash");

    buttonContainer.appendChild(updateBtn);
    buttonContainer.appendChild(deleteBtn);
    //deleteButton.appendChild(deleteBtnIcon);
    //updateButton.appendChild(updateBtnIcon);
    //contentElement.appendChild(updateButton);
    //contentElement.appendChild(deleteButton);
    //contentElement.appendChild(buttonContainer);
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
  const headerElement = document.createElement("div");
  headerElement.className = "d-flex flex-row justify-content-between flex-wrap";
  const userElement = document.createElement("div");
  userElement.classList.add("message-user");

  const usernameSpan = document.createElement("span");
  usernameSpan.classList.add("message-username");
  usernameSpan.textContent = username;

  const contentElement = document.createElement("div");
  contentElement.classList.add("message-content");

  const messageParagraph = document.createElement("p");
  messageParagraph.textContent = message;

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "message-buttons"
  const updateBtn = document.createElement("i");
  updateBtn.onclick = () => {
    showEditMessageModal({messageId:id, messageContent:messageParagraph.textContent});
  };
  updateBtn.classList.add("btn", "bi", "bi-pencil");
  const deleteBtn = document.createElement("i");
  deleteBtn.onclick = () => {
    socket.emit("chat:deleteMessage", id);
  };
  deleteBtn.classList.add("btn", "bi", "bi-trash");

  buttonContainer.appendChild(updateBtn);
  buttonContainer.appendChild(deleteBtn);
  contentElement.appendChild(messageParagraph);

  userElement.appendChild(usernameSpan);
  headerElement.appendChild(userElement);
  if (canDeleteMessage(username)) headerElement.appendChild(buttonContainer);
  messageElement.appendChild(headerElement);
  messageElement.appendChild(contentElement);
  chatMessages.appendChild(messageElement);
}

function showEditMessageModal({messageId, messageContent}) {
  editMessageInput.value = messageContent;
  editMessageModalElement.setAttribute("message-id", messageId);
  editMessageModal.show();
}

function handleSaveMessageInput(event) {
  event.preventDefault();
  const messageId = editMessageModalElement.getAttribute("message-id");
  const newMessage = editMessageInput.value;
  console.log(`Message id: ${messageId}, New message: ${newMessage}`);
  socket.emit("chat:updateMessage", { id:messageId, message: newMessage });
  editMessageModal.hide();
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