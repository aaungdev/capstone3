"use strict";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Get the modal
  const modal = document.getElementById("postModal");
  console.log("Modal:", modal);

  // Get the div that opens the modal
  const fakeInput = document.getElementById("openModalInput");
  console.log("Fake input:", fakeInput);

  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName("close")[0];
  console.log("Close button:", span);

  // When the user clicks the div, open the modal
  fakeInput.onclick = function () {
    console.log("Fake input clicked");
    modal.style.display = "block";
  };

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  const createPostForm = document.querySelector(".modal .createPostInput");
  console.log("Create post form:", createPostForm);

  createPostForm.addEventListener("submit", createPost);
});

async function createPost(event) {
  event.preventDefault();

  const input = document.querySelector(".modal .createPostInput textarea");
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

    const newPost = await response.json();
    input.value = "";
    document.getElementById("postModal").style.display = "none"; // Close the modal
    fetchPosts(); // Refresh the posts to include the new post
  } catch (error) {
    console.error("Error creating post:", error);
  }
}
