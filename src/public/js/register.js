document.addEventListener("DOMContentLoaded", function () {
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("password-check");
  const passwordMismatchError = document.getElementById(
    "password-mismatch-error",
  );

  function checkPasswordsMatch() {
    if (passwordField.value !== confirmPasswordField.value) {
      confirmPasswordField.classList.add("is-invalid");
      passwordMismatchError.style.display = "block";
    } else {
      confirmPasswordField.classList.remove("is-invalid");
      passwordMismatchError.style.display = "none";
    }
  }

  confirmPasswordField.addEventListener("input", checkPasswordsMatch);
  passwordField.addEventListener("input", checkPasswordsMatch);

  const form = document.getElementById("registerForm");
  const submitButton = form.querySelector('button[type="submit"]');
  const spinner = submitButton.querySelector(".spinner-border");
  const errorMessageDiv = document.getElementById("errorMessage");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Check if passwords match before submitting
    if (passwordField.value !== confirmPasswordField.value) {
      errorMessageDiv.textContent = "Passwords do not match.";
      errorMessageDiv.style.display = "block";
      return;
    }

    await submitForm(form);
  });

  async function submitForm(form) {
    const formData = Object.fromEntries(new FormData(form));
    const url = form.action;
    const method = form.method;

    // Show spinner
    spinner.classList.remove("d-none");
    submitButton.disabled = true;

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    response
      .json()
      .then((data) => {
        if (response.ok) {
          window.location.href = "/profile";
        } else {
          throw new Error(
            data.message || "An error occurred during registration",
          );
        }
      })
      .catch((error) => {
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.style.display = "block";
      })
      .finally(() => {
        // Hide spinner
        spinner.classList.add("d-none");
        submitButton.disabled = false;
      });
  }

  // Handle OAuth links
  const oauthLinks = document.querySelectorAll(".js-oauth-link");
  oauthLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = this.href;
    });
  });
});
