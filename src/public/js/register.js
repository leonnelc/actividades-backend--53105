// Get the password and confirm password fields
const passwordField = document.getElementById("password");
const confirmPasswordField = document.getElementById("password-check");
const passwordMismatchError = document.getElementById(
  "password-mismatch-error"
);

// Add an event listener to the confirm password field
function checkPasswordsMatch() {
  // Check if the passwords match
  if (passwordField.value !== confirmPasswordField.value) {
    confirmPasswordField.classList.add("is-invalid");
    passwordMismatchError.style.display = "block";
  } else {
    confirmPasswordField.classList.remove("is-invalid");
    passwordMismatchError.style.display = "none";
  }
}
confirmPasswordField.oninput = checkPasswordsMatch;
passwordField.oninput = checkPasswordsMatch;
