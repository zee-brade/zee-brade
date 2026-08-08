document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("ctaButton");

  if (!button) return;

  button.addEventListener("click", () => {
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Loading...";

    setTimeout(() => {
      window.location.href = "https://zee-brade.github.io/zee-brade/percobaan/try1";
    }, 500);
  });
});
