const buttons = document.querySelectorAll(".post-content button");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    alert("Full article coming soon 📖");
  });
});