"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const token = getLoginData().token;
  const username = getLoginData().username;

  if (!token || !username) {
    window.location.replace("../account/login.html");
    return;
  }

  fetchUserDetails(username, token).then((user) => {
    updateDropdownUserDetails(user);
    updateSidebarUserDetails(user);
  });

  fetchPosts(token, username);

  const createPostInput = document.querySelector(".createPostInput input");
  createPostInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      createPost(token, username);
    }
  });
});

async function fetchPosts(token, username) {
  try {
    const response = await fetch(
      "http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts",
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
    displayPosts(posts, token, username);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

function displayPosts(posts, token, username) {
  const mainContent = document.querySelector(".mainContent");
  const createPostSection = document.querySelector(".createPost");
  const sortBySection = document.querySelector(".sortBy");

  mainContent.innerHTML = "";
  mainContent.appendChild(createPostSection);
  mainContent.appendChild(sortBySection);

  posts.forEach((post) => {
    const postElement = document.createElement("article");
    postElement.classList.add("post");

    const postAuthor = `
      <article class="postAuthor">
          <img src="images/user.png" alt="User">
          <article>
              <h1>${post.username}</h1>
              <small>${post.bio || ""}</small>
              <small>${new Date(post.createdAt).toLocaleTimeString()}</small>
          </article>
      </article>`;

    const postContent = `<p>${post.text}</p>`;
    const postImage = post.image
      ? `<img src="${post.image}" alt="Post Image" width="100%">`
      : "";

    const like = post.likes.find((like) => like.username === username);
    const isLiked = !!like;

    const postStats = `
      <article class="postStats">
          <article>
              <img src="images/like.svg" alt="Like">
              <img src="images/love.svg" alt="Love">
              <img src="images/celebrate.svg" alt="Celebrate">
              <img src="images/support.svg" alt="Support">
              <img src="images/insightful.svg" alt="Insightful">
              <img src="images/funny.svg" alt="funny">
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
            isLiked ? "liked" : ""
          }" data-post-id="${post._id}" data-like-id="${
      isLiked ? like._id : ""
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
    mainContent.appendChild(postElement);
  });

  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", (event) =>
      toggleLike(event, token, username)
    );
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
      likeButton.dataset.likeId = ""; // Clear the like ID after removing
    } else {
      const newLikeId = await addLike(postId, token);
      likeButton.classList.add("liked");
      likeButton.dataset.likeId = newLikeId; // Store the new like ID
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }

  fetchPosts(token, username);
}

async function addLike(postId, token) {
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
      throw new Error("Failed to add like");
    }

    const result = await response.json();
    return result._id; // Return the new like ID
  } catch (error) {
    console.error("Error adding like:", error);
  }
}

async function removeLike(likeId, token) {
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
      throw new Error("Failed to remove like");
    }
  } catch (error) {
    console.error("Error removing like:", error);
  }
}

async function createPost(token) {
  const input = document.querySelector(".createPostInput input");
  const postText = input.value.trim();

  if (!postText) {
    alert("Post content cannot be empty!");
    return;
  }

  try {
    const response = await fetch(
      "http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: postText }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create post");
    }

    input.value = "";
    fetchPosts(token); // Refresh the posts to include the new post
  } catch (error) {
    console.error("Error creating post:", error);
  }
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
    logout();
  });

function logout() {
  window.localStorage.removeItem("login-data");
  window.location.href = "../account/login.html";
}

// Function to update dropdown menu user details
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

// Function to update sidebar user details
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

function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
}
