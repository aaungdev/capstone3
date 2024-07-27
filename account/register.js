"use strict";

document.querySelector("#signupForm").onsubmit = function (event) {
  event.preventDefault();

  const emailOrPhone = document.querySelector("#emailOrPhone").value;
  const password = document.querySelector("#password").value;

  // Store these values in localStorage for use in the next step
  localStorage.setItem("temp-username", emailOrPhone);
  localStorage.setItem("temp-password", password);

  // Redirect to the next step
  window.location.href = "register-step2.html";
};

// Add event listener for the "show" text
document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordField = document.getElementById("password");
    const passwordFieldType =
      passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", passwordFieldType);
    this.textContent = passwordFieldType === "password" ? "show" : "hide";
  });
