"use strict";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsZXgxMjM0IiwiaWF0IjoxNzE5MjM2NTIyLCJleHAiOjE3MTkzMjI5MjJ9.Xn9G394Zx-CzSRvyCU-uHuLgKfaMFEdBQJPsEwfskcw";

document.addEventListener("DOMContentLoaded", () => {
  const editFullNameBtn = document.getElementById("editFullNameBtn");
  const editFullNameInput = document.getElementById("editFullNameInput");
  const fullName = document.getElementById("fullName");

  const editBioBtn = document.getElementById("editBioBtn");
  const editBioInput = document.getElementById("editBioInput");
  const bio = document.getElementById("bio");

  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  editFullNameBtn.addEventListener("click", () => {
    document
      .querySelector(".userBioDetails")
      .classList.add("edit-fullname", "edit-mode");
    editFullNameInput.value = fullName.textContent;
  });

  editBioBtn.addEventListener("click", () => {
    document
      .querySelector(".userBioDetails")
      .classList.add("edit-bio", "edit-mode");
    editBioInput.value = bio.textContent;
  });

  cancelEditBtn.addEventListener("click", () => {
    document
      .querySelector(".userBioDetails")
      .classList.remove("edit-fullname", "edit-bio", "edit-mode");
  });

  saveProfileBtn.addEventListener("click", async () => {
    const updatedFullName = editFullNameInput.value.trim();
    const updatedBio = editBioInput.value.trim();

    if (updatedFullName && updatedBio) {
      try {
        const response = await fetch(
          `http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/alex1234`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fullName: updatedFullName,
              bio: updatedBio,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }

        const updatedUser = await response.json();
        fullName.textContent = updatedUser.fullName;
        bio.textContent = updatedUser.bio;

        document
          .querySelector(".userBioDetails")
          .classList.remove("edit-fullname", "edit-bio", "edit-mode");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      alert("Full Name and Bio cannot be empty!");
    }
  });
});
