"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const token = getLoginData().token;
  const username = getLoginData().username;

  if (!token || !username) {
    window.location.replace("../account/login.html");
    return;
  }

  const fullNameElement = document.getElementById("fullName");
  const bioElement = document.getElementById("bio");

  const modal = document.getElementById("editProfileModal");
  const span = document.getElementsByClassName("close")[0];
  const editFullNameBtn = document.getElementById("editFullNameBtn");
  const editProfileForm = document.getElementById("editProfileForm");
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const additionalName = document.getElementById("additionalName");
  const pronouns = document.getElementById("pronouns");
  const headline = document.getElementById("headline");

  fetchUserDetails(username, token);

  // Open modal
  editFullNameBtn.addEventListener("click", () => {
    modal.style.display = "block";
    const [first, last] = fullNameElement.textContent.split(' ');
    firstName.value = first || '';
    lastName.value = last || '';
    headline.value = bioElement.textContent;
  });

  // Close modal
  span.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  editProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const updatedFirstName = firstName.value.trim();
    const updatedLastName = lastName.value.trim();
    const updatedFullName = `${updatedFirstName} ${updatedLastName}`;
    const updatedHeadline = headline.value.trim();

    if (updatedFullName && updatedHeadline) {
      try {
        const updatedUser = await updateUserDetails(
          username,
          updatedFullName,
          updatedHeadline,
          token
        );
        fullNameElement.textContent = updatedUser.fullName;
        bioElement.textContent = updatedUser.bio;
        modal.style.display = "none";
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      alert("Full Name and Headline cannot be empty!");
    }
  });
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

    const user = await response.json();
    document.getElementById("fullName").textContent =
      user.fullName || "No name provided";
    document.getElementById("bio").textContent = user.bio || "No bio provided";
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
}

async function updateUserDetails(username, fullName, bio, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${username}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName,
          bio: bio,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
}

function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
}
