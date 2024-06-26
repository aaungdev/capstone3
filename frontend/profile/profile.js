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
  const headline = document.getElementById("headline");

  fetchUserDetails(username, token).then((user) => {
    fullNameElement.textContent = user.fullName || "No name provided";
    bioElement.textContent = user.bio || "No bio provided";
    updateDropdownUserDetails(user);
  });

  fetchUserPosts(username, token);

  editFullNameBtn.addEventListener("click", async () => {
    modal.style.display = "block";
    const fullName = fullNameElement.textContent.trim();
    const [first, ...last] = fullName.split(" ");
    firstName.value = first || "";
    lastName.value = last.join(" ") || "";
    headline.value = bioElement.textContent.trim();
  });

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
        updateDropdownUserDetails(updatedUser);
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

    return await response.json();
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

async function fetchUserPosts(username, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const posts = await response.json();
    const userPosts = posts.filter((post) => post.username === username);
    displayUserPosts(userPosts, token, username);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

function displayUserPosts(posts, token, username) {
  const postsContainer = document.querySelector(".postsContainer");

  if (!postsContainer) {
    console.error("Posts container element not found");
    return;
  }

  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postElement = document.createElement("article");
    postElement.classList.add("post");

    const postDate = new Date(post.createdAt);
    const formattedDate = postDate.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const postAuthor = `
      <article class="postAuthor">
          <img src="../images/user.png" alt="User">
          <article>
              <h1>${post.username}</h1>
              <small>${post.bio || ""}</small>
              <small>${formattedDate}</small>
          </article>
          <div class="postOptions">
              <button class="optionsBtn"><i class="fas fa-ellipsis-h"></i></button>
              <button class="closeBtn"><i class="fas fa-times"></i></button>
          </div>
      </article>`;

    const postContent = `<p>${post.text}</p>`;
    const postImage = post.image
      ? `<img src="${post.image}" alt="Post Image" width="100%">`
      : "";

    const postStats = `
      <article class="postStats">
          <article>
              <img src="../images/like.svg" alt="Like">
              <img src="../images/love.svg" alt="Love">
              <img src="../images/celebrate.svg" alt="Celebrate">
              <img src="../images/support.svg" alt="Support">
              <img src="../images/insightful.svg" alt="Insightful">
              <img src="../images/funny.svg" alt="funny">
              <span class="likedUser">${post.likes.length} likes</span>
          </article>
          <article>
              <span>${
                post.comments || 0
              } comments</span> <b>&nbsp;-&nbsp;</b> <span>${
      post.shares || 0
    } shares</span>
          </article>
      </article>`;

    const postActivity = `
      <article class="postActivity">
          <article class="postActivityLink like-button ${
            post.likes.some((like) => like.username === username) ? "liked" : ""
          }" data-post-id="${post._id}" data-like-id="${
      post.likes.find((like) => like.username === username)?._id || ""
    }">
              <i class='bx bx-like bx-flip-horizontal'></i>&nbsp;<span>Like</span>
          </article>
          <article class="postActivityLink">
              <i class='bx bx-comment-detail'></i>&nbsp;<span>Comment</span>
          </article>
          <article class="postActivityLink">
              <i class='bx bx-repost'></i>&nbsp;<span>Repost</span>
          </article>
          <article class="postActivityLink">
              <i class='bx bxs-send'></i>&nbsp;<span>Send</span>
          </article>
      </article>`;

    postElement.innerHTML =
      postAuthor + postContent + postImage + postStats + postActivity;
    postsContainer.appendChild(postElement);
  });

  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", (event) =>
      toggleLike(event, token, username)
    );
  });

  document.querySelectorAll(".optionsBtn").forEach((button) => {
    button.addEventListener("click", (event) => {
      console.log(
        "Options button clicked for post:",
        event.currentTarget.closest(".post")
      );
    });
  });

  document.querySelectorAll(".closeBtn").forEach((button) => {
    button.addEventListener("click", (event) => {
      console.log(
        "Close button clicked for post:",
        event.currentTarget.closest(".post")
      );
    });
  });
}

async function toggleLike(event, token, username) {
  const postId = event.currentTarget.dataset.postId;
  const likeId = event.currentTarget.dataset.likeId;
  const likeButton = event.currentTarget;
  const isLiked = likeButton.classList.contains("liked");

  try {
    if (isLiked) {
      await removeLike(likeId, token);
      likeButton.classList.remove("liked");
      likeButton.dataset.likeId = "";
    } else {
      const newLikeId = await addLike(postId, token);
      likeButton.classList.add("liked");
      likeButton.dataset.likeId = newLikeId;
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }

  fetchUserPosts(username, token);
}

async function addLike(postId, token) {
  console.log(`Adding like to postId: ${postId}`);
  try {
    const response = await fetch(
      "http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      }
    );

    if (!response.ok) {
      console.error("Failed to add like", await response.json());
      throw new Error("Failed to add like");
    }

    const result = await response.json();
    console.log("Like added successfully", result);
    return result._id;
  } catch (error) {
    console.error("Error adding like:", error);
  }
}

async function removeLike(likeId, token) {
  console.log(`Removing like with likeId: ${likeId}`);
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${likeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to remove like", await response.json());
      throw new Error("Failed to remove like");
    }

    console.log("Like removed successfully");
  } catch (error) {
    console.error("Error removing like:", error);
  }
}

function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
}

function toggleMenu() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("show");
}

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

document
  .getElementById("viewProfileButton")
  .addEventListener("click", function () {
    window.location.href = "profile.html";
  });

document
  .getElementById("logoutButton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    logout();
  });

function logout() {
  window.localStorage.removeItem("login-data");
  window.location.href = "../account/login.html";
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
