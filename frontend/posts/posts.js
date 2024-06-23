"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsZXgxMjM0IiwiaWF0IjoxNzE5MTU3NDkwLCJleHAiOjE3MTkyNDM4OTB9.bNlxL8YTydqW-g3fHPvvpGvtmRDSjksSkHR_mbdb49A";

  fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      displayPosts(data);
    })
    .catch((error) => {
      console.error("Error fetching posts:", error);
    });
});

function displayPosts(posts) {
  const mainContent = document.querySelector(".mainContent");

  posts.forEach((post) => {
    const postElement = document.createElement("article");
    postElement.classList.add("post");

    const postAuthor = document.createElement("article");
    postAuthor.classList.add("postAuthor");

    const authorImg = document.createElement("img");
    authorImg.src = "images/aaung.png"; // Placeholder image source, replace with actual data if available
    authorImg.alt = "User";
    postAuthor.appendChild(authorImg);

    const authorInfo = document.createElement("article");
    const authorName = document.createElement("h1");
    authorName.textContent = post.username;
    authorInfo.appendChild(authorName);

    const postDate = document.createElement("small");
    postDate.textContent = new Date(post.createDate).toLocaleString();
    authorInfo.appendChild(postDate);

    postAuthor.appendChild(authorInfo);
    postElement.appendChild(postAuthor);

    const postText = document.createElement("p");
    postText.textContent = post.text;
    postElement.appendChild(postText);

    const postStats = document.createElement("article");
    postStats.classList.add("postStats");

    const postActivity = document.createElement("article");
    postActivity.classList.add("postActivity");

    ["Like", "Comment", "Repost", "Send"].forEach((action) => {
      const activityLink = document.createElement("article");
      activityLink.classList.add("postActivityLink");

      const icon = document.createElement("i");
      icon.classList.add("bx", `bx-${action.toLowerCase()}`);
      activityLink.appendChild(icon);

      const span = document.createElement("span");
      span.textContent = action;
      activityLink.appendChild(span);

      postActivity.appendChild(activityLink);
    });

    postElement.appendChild(postStats);
    postElement.appendChild(postActivity);

    mainContent.appendChild(postElement);
  });
}
