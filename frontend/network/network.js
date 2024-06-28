"use strict";

let allUsers = [];

document.addEventListener("DOMContentLoaded", function () {
  const loginData = getLoginData();
  const userCardsContainer = document.getElementById("userCardsContainer");
  const searchInput = document.getElementById("searchInput");

  if (!loginData || !loginData.token) {
    window.location.replace("../account/login.html");
    return;
  }

  fetchUserDetails(loginData.username, loginData.token).then((user) => {
    updateDropdownUserDetails(user);
    updateSidebarUserDetails(user);
  });

  fetchAllUsers();

  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const query = searchInput.value.trim().toLowerCase();
      if (query) {
        // Filter users locally based on the search query
        const filteredUsers = allUsers.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
            user.fullName.toLowerCase().includes(query)
        );
        displayUsers(filteredUsers);
      } else {
        displayUsers(allUsers); // Display all users if search is cleared
      }
    }
  });

  const profileDropdownToggle = document.querySelector(".online");
  profileDropdownToggle.addEventListener("click", toggleMenu);

  // Add event listener for "View Profile" button
  document
    .getElementById("viewProfileButton")
    .addEventListener("click", function () {
      window.location.href = "../profile/profile.html";
    });

  // Add event listener for "Sign Out" link
  document
    .getElementById("logoutButton")
    .addEventListener("click", function (event) {
      event.preventDefault();
      logout(loginData.token);
    });

  function fetchAllUsers() {
    const url =
      "http://microbloglite.us-east-2.elasticbeanstalk.com/api/users?limit=1000&offset=0";

    fetch(url, {
      headers: {
        Authorization: `Bearer ${loginData.token}`,
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((users) => {
        allUsers = users; // Store all users in the global variable
        displayUsers(allUsers);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }

  function displayUsers(users) {
    userCardsContainer.innerHTML = "";
    users.forEach((user) => {
      const userCard = createUserCard(user);
      userCardsContainer.appendChild(userCard);
    });
  }

  function createUserCard(user) {
    const card = document.createElement("article");
    card.classList.add("peopleConnectCard");

    const defaultBio =
      "Yearup Student | Application Developer | Frontend Focus | Future Leader";
    const bio =
      user.bio && user.bio.length > 50
        ? user.bio.substring(0, 50) + "..."
        : user.bio || defaultBio;

    card.innerHTML = `
      <img src="../images/linkedin-background.webp" alt="Background Image" class="cardBgImg" />
      <article class="connectCardInner">
          <img src="../images/user2.png" alt="User Image" class="cardInnerImg" />
          <span class="closeIcon"><i class="bx bx-x"></i></span>
          <h4>${user.fullName}</h4>
          <p>${bio}</p>
      </article>
      <article class="cardConnectBtn">
          <a href="#" class="connectLink"><i class="bx bxs-user-plus"></i>Connect</a>
      </article>
    `;

    return card;
  }

  function toggleMenu() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.classList.toggle("show");
  }

  // Close the dropdown if clicked outside
  window.onclick = function (event) {
    if (
      !event.target.matches(".online img") &&
      !event.target.closest(".dropdownMenu")
    ) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu.classList.contains("show")) {
        dropdownMenu.classList.remove("show");
      }
    }
  };
});

async function fetchUserDetails(username, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
}

function updateDropdownUserDetails(user) {
  const dropdownFullNameElement = document.querySelector(
    ".dropdownMenu .profileInfo h4"
  );
  const dropdownBioElement = document.querySelector(
    ".dropdownMenu .profileInfo p"
  );
  dropdownFullNameElement.textContent = user.fullName || "No name provided";
  dropdownBioElement.textContent = user.bio || "No bio provided";
}

function updateSidebarUserDetails(user) {
  const sidebarFullNameElement = document.querySelector(
    ".sidebarProfileInfo figcaption"
  );
  const sidebarBioElement = document.querySelector(".profileInfoTitle");
  const sidebarImageElement = document.querySelector(".sidebarProfileInfo img");
  sidebarFullNameElement.textContent = user.fullName || "No name provided";
  sidebarBioElement.textContent = user.bio || "No bio provided";
  sidebarImageElement.src = user.profileImage || "https://i.pravatar.cc/300"; // Default image if none provided
}

function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
}

async function logout(token) {
  try {
    const response = await fetch(
      "http://microbloglite.us-east-2.elasticbeanstalk.com/api/logout",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to log out");
    }

    window.localStorage.removeItem("login-data");
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Error logging out:", error);
    window.localStorage.removeItem("login-data");
    window.location.href = "../index.html";
  }
}
