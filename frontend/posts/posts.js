"use strict";

let allPosts = []; // Global variable to store all posts

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

  // Event listener for the search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      // Filter posts locally based on the search query
      const filteredPosts = allPosts.filter(
        (post) =>
          post.username.toLowerCase().includes(query) ||
          post.text.toLowerCase().includes(query)
      );
      displayPosts(filteredPosts, token, username);
    } else {
      displayPosts(allPosts, token, username); // Display all posts if search is cleared
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

    allPosts = await response.json(); // Store all posts in the global variable
    displayPosts(allPosts, token, username);
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

    const bio = "Yearup Student | Application Developer | Future Leader"; // Default bio

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
          ${
            post.likes.length > 0
              ? `
              <article>
                <img src="images/like.svg" alt="Like">
                <img src="images/love.svg" alt="Love">
                <img src="images/celebrate.svg" alt="Celebrate">
                <img src="images/support.svg" alt="Support">
                <img src="images/insightful.svg" alt="Insightful">
                <img src="images/funny.svg" alt="Funny">
                <span class="likedUser">${post.likes.length} likes</span>
              </article>
              ${
                post.comments || post.shares
                  ? `<article>
                  ${
                    post.comments
                      ? `<span>${post.comments} comments</span>`
                      : ""
                  }
                  ${
                    post.shares
                      ? `<b>&nbsp;-&nbsp;</b> <span>${post.shares} shares</span>`
                      : ""
                  }
              </article>`
                  : ""
              }`
              : ""
          }
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
    button.addEventListener("click", async (event) => {
      const postId = event.currentTarget.dataset.postId;
      const likeId = event.currentTarget.dataset.likeId;
      const isLiked = event.currentTarget.classList.contains("liked");

      if (isLiked) {
        await removeLike(likeId, token);
      } else {
        await addReaction(postId, token);
      }
      fetchPosts(token, username); // Refresh posts to update the UI
    });
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

async function addReaction(postId, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: postId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add reaction");
    }

    return await response.json(); // Return the new reaction
  } catch (error) {
    console.error("Error adding reaction:", error);
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

    return await response.json(); // Return the removed like
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
