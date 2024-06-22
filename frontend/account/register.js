"use strict";

const apiBaseURL = "http://microbloglite.us-east-2.elasticbeanstalk.com";

document.querySelector(".signupForm").onsubmit = function (event) {
  event.preventDefault();

  const newUser = {
    username: document.querySelector("#emailOrPhone").value,
    fullName: document.querySelector("#fullName").value,
    password: document.querySelector("#password").value,
  };

  createUser(newUser);
};

function createUser(userData) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  };

  fetch(apiBaseURL + "/api/users", options)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.message);
      } else {
        alert("User created successfully!");
        // Automatically log in the user and redirect to posts page
        login({
          username: userData.username,
          password: userData.password,
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function login(loginData) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  };

  fetch(apiBaseURL + "/auth/login", options)
    .then((response) => response.json())
    .then((loginData) => {
      window.localStorage.setItem("login-data", JSON.stringify(loginData));
      window.location.assign("/frontend/posts/posts.html"); // redirect
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
