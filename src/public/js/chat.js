const socket = io();

const chatInput = document.getElementById("chat-input");
const message = document.getElementById("message");
const chatMessages = document.getElementById("chat-messages");
chatInput.addEventListener("keyup", (event) => {
    if (event.key == "Enter"){
        sendMessage();
    }
})
function sendMessage(){
    let msg = message.value.trim();
    message.value = "";
    socket.emit("message", msg);
}
function addMessage(username, message) {
    const userElement = document.createElement("div");
    userElement.classList.add("message-user");
  
    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("message-username");
    usernameSpan.textContent = username;
  
    const contentElement = document.createElement("div");
    contentElement.classList.add("message-content");
  
    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = message;
  
    contentElement.appendChild(messageParagraph);
    userElement.appendChild(usernameSpan);
  
    chatMessages.appendChild(userElement);
    chatMessages.appendChild(contentElement);
}

function showError(message) {
    new swal({
        title: message,
        icon: 'error',
        confirmButtonText: 'OK'
    })
}

socket.on("error", (error) => {
    showError(error);
})

socket.on("message", (message) => {
    let username = message.username;
    let text = message.message;
    let scroll = (chatMessages.scrollHeight - chatMessages.clientHeight == chatMessages.scrollTop);
    addMessage(username, text);
    if (scroll){
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
})


Swal.fire({
    title: "Enter your username (email)",
    input: "text",
    inputAttributes: {
      autocapitalize: "off"
    },
    showCancelButton: false,
    confirmButtonText: "Log in",
    showLoaderOnConfirm: true,
    preConfirm: async (login) => {
        try {

        let timer = sleep(2000);
        let validLogin;
        socket.on("validLogin", () => {
            validLogin = true;
            timer.abort();
        })
        socket.on("invalidLogin", () => {
            validLogin = false;
            timer.abort();
        });
        socket.emit("joinChat", {username:login});
        await timer;
        if (validLogin == null){
            return Swal.showValidationMessage("Timed out");
        }
        if (validLogin == false){
            return Swal.showValidationMessage("Invalid email");
        }
        return;
      } catch (error) {
        Swal.showValidationMessage(`
          Request failed: ${error}
        `);
      }
    },
    allowOutsideClick: false
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: `Succesfully logged in`
      });
    }
  });

const sleep = (ms) => {
    let resolver;
    let timeoutId;
    const promise = new Promise((resolve) => {
        timeoutId = setTimeout(resolve, ms)
        resolver = resolve;
    });
    promise.abort = (reason = undefined) => {
        clearTimeout(timeoutId);
        resolver(reason);
    }
    return promise;
};

chatMessages.scrollTop = chatMessages.scrollHeight;




