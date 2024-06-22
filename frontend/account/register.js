"use strict";

const apiBaseURL = "http://microbloglite.us-east-2.elasticbeanstalk.com";

document.querySelector(".signupForm").onsubmit = function (event) {
  event.preventDefault();

  const newUser = {
    username: document.querySelector("#emailOrPhone").value,
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
    .then((response) => {
      if (response.status === 409) {
        throw new Error("Username already exists");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.message);
      } else {
        showStep2Form();
      }
    })
    .catch((error) => {
      alert("Error: " + error.message);
      console.error("Error:", error);
    });
}

function showStep2Form() {
  document.querySelector(".signupContent").innerHTML = `
    <div class="titleArea">
      <h1 class="title">Final Step</h1>
    </div>
    <article class="signupArea">
      <form id="step2Form" class="signupForm">
        <div class="field">
          <label for="firstName">First Name</label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="First Name"
            autocomplete="on"
            required
            autofocus
          />
        </div>
        <div class="field">
          <label for="lastName">Last Name</label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="Last Name"
            autocomplete="on"
            required
          />
        </div>
        <div class="button">
          <input type="submit" value="Create" />
        </div>
      </form>
    </article>
  `;

  document.querySelector("#step2Form").onsubmit = function (event) {
    event.preventDefault();

    const fullName =
      document.querySelector("#firstName").value +
      " " +
      document.querySelector("#lastName").value;

    completeRegistration(fullName);
  };
}

function completeRegistration(fullName) {
  const loginData = {
    username: document.querySelector("#emailOrPhone").value,
    password: document.querySelector("#password").value,
  };

  const userData = {
    ...loginData,
    fullName: fullName,
  };

  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`, // Add the token for authentication
    },
    body: JSON.stringify(userData),
  };

  fetch(apiBaseURL + "/api/users/" + loginData.username, options)
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

function getToken() {
  const loginData = JSON.parse(window.localStorage.getItem("login-data"));
  return loginData.token;
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
      username: document.querySelector("#emailOrPhone").value,
      password: document.querySelector("#password").value,
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
