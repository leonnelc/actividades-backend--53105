const alertContainer = document.getElementById("alert-container");
const appendAlert = (message, type) => {
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
    "fade"
  );
  alert.appendChild(alertMessage);
  alert.appendChild(button);
  alertContainer.append(alert);
  setTimeout(() => {
    alert.classList.add("show");
  }, 10);
  setTimeout(() => {
    button.click();
  }, 2500);
};