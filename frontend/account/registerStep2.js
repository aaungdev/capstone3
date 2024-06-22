"use strict";

const apiBaseURL = "http://microbloglite.us-east-2.elasticbeanstalk.com";

document.querySelector("#completeProfileForm").onsubmit = function (event) {
  event.preventDefault();

  const newUserData = JSON.parse(window.localStorage.getItem("new-user-data"));
  newUserData.firstName = document.querySelector("#firstName").value;
  newUserData.lastName = document.querySelector("#lastName").value;

  createUser(newUserData);
};

function createUser(userData) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: userData.username,
      password: userData.password,
      fullName: `${userData.firstName} ${userData.lastName}`,
    }),
  };

  fetch(apiBaseURL + "/api/users", options)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.message);
      } else {
        showModal();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function showModal() {
  const modal = document.getElementById("successModal");
  modal.style.display = "block";

  const closeBtn = document.querySelector(".closeBtn");
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  const goToPostsBtn = document.getElementById("goToPostsBtn");
  goToPostsBtn.onclick = function () {
    login({
      username: JSON.parse(window.localStorage.getItem("new-user-data"))
        .username,
      password: JSON.parse(window.localStorage.getItem("new-user-data"))
        .password,
    });
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
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
