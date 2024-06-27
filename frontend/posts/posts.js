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

    const postDate = new Date(post.createdAt);
    const now = new Date();
    const timeDiff = Math.abs(now - postDate);
    let formattedDate;
    if (timeDiff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(timeDiff / (60 * 60 * 1000));
      const minutes = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
      formattedDate = hours > 0 ? `${hours}h` : `${minutes}m`;
    } else {
      const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
      formattedDate = `${days}d`;
    }

    const bio = "Yearup Student"; // Default bio

    const postAuthor = `
      <article class="postAuthor">
          <img src="images/user.png" alt="User">
          <article>
              <h1>${post.username}</h1>
              <p>${bio}</p>
              <small>${formattedDate} <i class="bi bi-globe"></i></small>
          </article>
          <div class="customPostOptions">
              <button class="customOptionsBtn"><i class="bi bi-three-dots"></i></button>
              <button class="customCloseBtn"><i class="bi bi-x"></i></button>
              <div class="customDropdownMenu">
                  <a href="#"><i class="bi bi-bookmark"></i> Save</a>
                  <a href="#"><i class="bi bi-link-45deg"></i> Copy link to post</a>
                  <a href="#"><i class="bi bi-eye-slash"></i> Not interested</a>
                  <a href="#"><i class="bi bi-person-x"></i> Unfollow</a>
                  <a href="#"><i class="bi bi-flag"></i> Report post</a>
              </div>
          </div>
      </article>`;

    const postContent = `<div id="postContent">${post.text}</div>`;
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
          ${
            post.comments || post.shares
              ? `<article>
              ${post.comments ? `<span>${post.comments} comments</span>` : ""}
              ${
                post.shares
                  ? `<b>&nbsp;-&nbsp;</b> <span>${post.shares} shares</span>`
                  : ""
              }
          </article>`
              : ""
          }
      </article>`;

    const postActivity = document.createElement("article");
    postActivity.classList.add("postActivity");

    const likeButton = document.createElement("article");
    likeButton.classList.add("postActivityLink", "like-button");
    if (isLiked) likeButton.classList.add("liked");
    likeButton.dataset.postId = post._id;
    if (isLiked) likeButton.dataset.likeId = like._id;

    const likeIcon = document.createElement("i");
    likeIcon.classList.add("bx", "bx-like", "bx-flip-horizontal");
    likeButton.appendChild(likeIcon);

    const likeText = document.createElement("span");
    likeText.innerText = "Like";
    likeButton.appendChild(likeText);

    const commentButton = document.createElement("article");
    commentButton.classList.add("postActivityLink");

    const commentIcon = document.createElement("i");
    commentIcon.classList.add("bx", "bx-comment-detail");
    commentButton.appendChild(commentIcon);

    const commentText = document.createElement("span");
    commentText.innerText = "Comment";
    commentButton.appendChild(commentText);

    const repostButton = document.createElement("article");
    repostButton.classList.add("postActivityLink");

    const repostIcon = document.createElement("i");
    repostIcon.classList.add("bx", "bx-repost");
    repostButton.appendChild(repostIcon);

    const repostText = document.createElement("span");
    repostText.innerText = "Repost";
    repostButton.appendChild(repostText);

    const sendButton = document.createElement("article");
    sendButton.classList.add("postActivityLink");

    const sendIcon = document.createElement("i");
    sendIcon.classList.add("bx", "bxs-send");
    sendButton.appendChild(sendIcon);

    const sendText = document.createElement("span");
    sendText.innerText = "Send";
    sendButton.appendChild(sendText);

    postActivity.appendChild(likeButton);
    postActivity.appendChild(commentButton);
    postActivity.appendChild(repostButton);
    postActivity.appendChild(sendButton);

    postElement.innerHTML = postAuthor + postContent + postImage + postStats;
    postElement.appendChild(postActivity);
    mainContent.appendChild(postElement);
  });

  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", (event) =>
      toggleLike(event, token, username)
    );
  });

  // Add event listeners for options button
  document.querySelectorAll(".customOptionsBtn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const postElement = event.currentTarget.closest(".post");
      const dropdownMenu = postElement.querySelector(".customDropdownMenu");
      dropdownMenu.classList.toggle("show");
    });
  });

  document.querySelectorAll(".customCloseBtn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const postElement = event.currentTarget.closest(".post");
      postElement.remove();
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".customOptionsBtn")) {
      document.querySelectorAll(".customDropdownMenu").forEach((menu) => {
        menu.classList.remove("show");
      });
    }
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
  window.location.href = "../index.html";
}

// Function to update dropdown menu user details
function updateDropdownUserDetails(user) {
  const dropdownFullNameElement = document.querySelector(
    ".dropdownMenu .profileInfo h4"
  );
  const dropdownBioElement = document.querySelector(
    ".dropdownMenu .profileInfo p"
  );
  dropdownFullNameElement.innerText = user.fullName || "No name provided";
  dropdownBioElement.innerText = user.bio || "No bio provided";
}

// Function to update sidebar user details
function updateSidebarUserDetails(user) {
  const sidebarFullNameElement = document.querySelector(
    ".sidebarProfileInfo figcaption"
  );
  const sidebarBioElement = document.querySelector(".profileInfoTitle");
  const sidebarImageElement = document.querySelector(".sidebarProfileInfo img");
  sidebarFullNameElement.innerText = user.fullName || "No name provided";
  sidebarBioElement.innerText = user.bio || "No bio provided";
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
