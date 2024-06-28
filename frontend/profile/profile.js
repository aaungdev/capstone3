"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const loginData = getLoginData();
  const token = loginData?.token;
  const username = loginData?.username;

  if (!token || !username) {
    window.location.replace("../account/login.html");
    return;
  }

  const fullNameElement = document.getElementById("fullName");
  const bioElement = document.getElementById("bio");

  fetchUserDetails(username, token).then((user) => {
    fullNameElement.textContent = user.fullName || "No name provided";
    bioElement.textContent = user.bio || "No bio provided";
    updateDropdownUserDetails(user);
  });

  fetchUserPosts(username, token);

  const modal = document.getElementById("editProfileModal");
  const span = document.getElementsByClassName("close")[0];
  const editFullNameBtn = document.getElementById("editFullNameBtn");
  const editProfileForm = document.getElementById("editProfileForm");
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const headline = document.getElementById("headline");

  editFullNameBtn.addEventListener("click", () => {
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

  document.addEventListener("click", (event) => {
    const isOptionsButton = event.target.closest(".customOptionsBtn");
    const dropdownMenus = document.querySelectorAll(".customDropdownMenu");

    if (isOptionsButton) {
      const postElement = isOptionsButton.closest(".post");
      const dropdownMenu = postElement.querySelector(".customDropdownMenu");
      dropdownMenus.forEach((menu) => {
        if (menu !== dropdownMenu) {
          menu.classList.remove("show");
        }
      });
      dropdownMenu.classList.toggle("show");
    } else {
      dropdownMenus.forEach((menu) => {
        if (!menu.contains(event.target)) {
          menu.classList.remove("show");
        }
      });
    }
  });

  document.addEventListener("click", async (event) => {
    if (event.target.matches(".delete-post")) {
      const postElement = event.target.closest(".post");
      const postId = postElement.dataset.postId;
      try {
        await deletePost(postId, token);
        postElement.remove();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
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

    const postsFromApi = await response.json();
    const savedPosts = loadPostsFromLocalStorage();
    const userPosts = postsFromApi.filter((post) => post.username === username);
    const allUserPosts = [...savedPosts, ...userPosts]; // Combine local and API posts
    displayUserPosts(allUserPosts, token, username);
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
    postElement.dataset.postId = post._id;

    const postDate = new Date(post.createdAt);
    const now = new Date();
    const timeDiff = Math.abs(now - postDate);
    const isRecent = timeDiff < 24 * 60 * 60 * 1000;

    const formattedDate = isRecent
      ? postDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : postDate.toLocaleDateString([], { month: "short", day: "numeric" });

    const postAuthor = `
      <article class="postAuthor">
          <img src="../images/user2.png" alt="User">
          <article>
              <h1>${post.username}</h1>
              <p>Yearup Student | Application Developer | Future Leader</p>
              <small>${formattedDate}  <i class="bi bi-globe"></i> </small>
          </article>
          <div class="customPostOptions">
              <button class="customOptionsBtn"><i class="bi bi-three-dots"></i></button>
              <div class="customDropdownMenu">
                  <a href="#"><i class="bi bi-bookmark"></i> Save</a>
                  <a href="#"><i class="bi bi-pencil"></i> Edit post</a>
                  <a href="#" class="delete-post"><i class="bi bi-trash"></i> Delete post</a>
                  <a href="#"><i class="bi bi-chat-dots"></i> Who can comment on this post?</a>
                  <a href="#"><i class="bi bi-eye"></i> Who can see this post?</a>
              </div>
          </div>
      </article>`;

    const postContent = `<p id="postContent">${post.text}</p>`;
    const postImage = post.image
      ? `<div class="postImageContainer"><img src="${post.image}" alt="Post Image"></div>`
      : "";

    const like = post.likes.find((like) => like.username === username);
    const isLiked = !!like;

    const postStats = `
      <article class="postStats">
          ${
            post.likes.length > 0
              ? `<article>
                  <img src="../posts/images/love.svg" alt="Love" style="display: ${
                    isLiked ? "inline" : "none"
                  };">
                  <span class="likedUser">${post.likes.length} likes</span>
              </article>`
              : ""
          }
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
    postsContainer.appendChild(postElement);
  });

  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", (event) =>
      toggleLike(event, token, username)
    );
  });
}

async function deletePost(postId, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts/${postId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete post");
    }

    console.log("Post deleted successfully");
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
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
    return result._id;
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

function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
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

document.getElementById("logoutButton").addEventListener("click", function () {
  logout();
});

function logout() {
  window.localStorage.removeItem("login-data");
  window.location.href = "../account/login.html";
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

function loadPostsFromLocalStorage() {
  return JSON.parse(localStorage.getItem("posts")) || [];
}
