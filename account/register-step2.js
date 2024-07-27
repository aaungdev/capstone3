"use strict";

const apiBaseURL = "http://microbloglite.us-east-2.elasticbeanstalk.com";

document.querySelector("#completeForm").onsubmit = function (event) {
  event.preventDefault();

  const firstName = document.querySelector("#firstName").value;
  const lastName = document.querySelector("#lastName").value;
  const fullName = `${firstName} ${lastName}`;
  const username = localStorage.getItem("temp-username");
  const password = localStorage.getItem("temp-password");

  const newUser = {
    username: username,
    fullName: fullName,
    password: password,
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
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message);
        });
      }
      return response.json();
    })
    .then((data) => {
      showModal();
    })
    .catch((error) => {
      alert("Error: " + error.message);
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
    window.location.assign("login.html"); // Redirect to login page
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}
