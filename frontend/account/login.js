"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("#loginForm");

  loginForm.onsubmit = function (event) {
    event.preventDefault();

    const loginData = {
      username: loginForm.username.value,
      password: loginForm.password.value,
    };

    loginForm.loginButton.disabled = true;

    login(loginData);
  };
});
