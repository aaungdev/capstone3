document.addEventListener("DOMContentLoaded", function () {
  const loginData = getLoginData();
  const userCardsContainer = document.getElementById("userCardsContainer");
  const searchInput = document.getElementById("searchInput");

  function fetchUserByUsername(username) {
    const url = `http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${username}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${loginData.token}`,
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("User not found");
        }
        return response.json();
      })
      .then((user) => {
        userCardsContainer.innerHTML = "";
        const userCard = createUserCard(user);
        userCardsContainer.appendChild(userCard);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        userCardsContainer.innerHTML = "<p>No user found</p>";
      });
  }

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
        userCardsContainer.innerHTML = "";
        users.forEach((user) => {
          const userCard = createUserCard(user);
          userCardsContainer.appendChild(userCard);
        });
      })
      .catch((error) => console.error("Error fetching users:", error));
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

  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        fetchUserByUsername(query);
      } else {
        fetchAllUsers();
      }
    }
  });

  // Fetch all users initially
  fetchAllUsers();
});
