const alertContainer = document.getElementById("alert-container");
const appendAlert = (message, type, duration) => {
  const alert = document.createElement("div");
  const alertMessage = document.createElement("div");
  alertMessage.innerHTML = message;
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("btn-close");
  button.setAttribute("data-bs-dismiss", "alert");
  button.setAttribute("aria-label", "Close");
  alert.classList.add(
    "alert",
    `alert-${type}`,
    "alert-dismissible",
    "user-select-none",
    "my-1",
    "mx-auto",
    "fade",
  );
  alert.appendChild(alertMessage);
  alert.appendChild(button);
  alertContainer.append(alert);
  if (duration == null) {
    duration = 2500;
  }
  setTimeout(() => {
    alert.classList.add("show");
  }, 10);
  if (duration) {
    setTimeout(() => {
      alert.classList.remove("show");
      setTimeout(() => {
        alert.remove();
      }, 250);
    }, duration);
  }
};
