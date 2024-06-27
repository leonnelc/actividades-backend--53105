document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const requestResetSection = document.getElementById("requestResetSection");
  const resetPasswordSection = document.getElementById("resetPasswordSection");
  const requestResetForm = document.getElementById("requestResetForm");
  const resetForm = document.getElementById("resetForm");
  const message = document.getElementById("message");
  const spinner = document.getElementById("spinner");

  if (token) {
    requestResetSection.style.display = "none";
    resetPasswordSection.style.display = "block";
  }

  requestResetForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;

    spinner.classList.remove("d-none");
    message.innerHTML = "";

    try {
      const response = await fetch(
        `/api/users/sendresetpassword?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        message.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      } else {
        message.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
      }
    } catch (error) {
      message.innerHTML =
        '<div class="alert alert-danger">An error occurred. Please try again.</div>';
    } finally {
      spinner.classList.add("d-none");
    }
  });

  resetForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      message.innerHTML =
        '<div class="alert alert-danger">Passwords do not match.</div>';
      return;
    }

    spinner.classList.remove("d-none");
    message.innerHTML = "";

    try {
      const response = await fetch(
        `/api/users/resetpassword?password=${encodeURIComponent(password)}&token=${encodeURIComponent(token)}`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        message.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      } else {
        message.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
      }
    } catch (error) {
      message.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again.</div>`;
    } finally {
      spinner.classList.add("d-none");
    }
  });
});
