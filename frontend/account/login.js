"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("#loginForm");
  const togglePassword = document.getElementById("togglePassword");

  loginForm.onsubmit = function (event) {
    event.preventDefault();

    const loginData = {
      username: loginForm.username.value,
      password: loginForm.password.value,
    };

    loginForm.loginButton.disabled = true;

    login(loginData);
  };

  // Add event listener for the "show" text
  togglePassword.addEventListener("click", function () {
    const passwordField = document.getElementById("password");
    const passwordFieldType =
      passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", passwordFieldType);
    this.textContent = passwordFieldType === "password" ? "show" : "hide";
  });
});
