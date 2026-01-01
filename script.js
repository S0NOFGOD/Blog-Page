const searchInput = document.getElementById("searchInput");
const posts = document.querySelectorAll(".post");

searchInput.addEventListener("keyup", function () {
  const value = searchInput.value.toLowerCase();

  posts.forEach(post => {
    const title = post.querySelector("h2").innerText.toLowerCase();
    post.style.display = title.includes(value) ? "block" : "none";
  });
});