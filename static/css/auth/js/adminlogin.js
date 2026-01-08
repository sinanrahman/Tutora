

if (typeof remainingTime !== "undefined" && remainingTime > 0) {
  let timeLeft = remainingTime;

  const timerEl = document.getElementById("timer");
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) loginBtn.disabled = true;

  const interval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (timerEl) {
      timerEl.textContent =
        `Try again in ${minutes} min ${seconds.toString().padStart(2, "0")} sec`;
    }

    if (timeLeft <= 0) {
      clearInterval(interval);
      if (timerEl) timerEl.textContent = "You can try logging in now.";
      if (loginBtn) loginBtn.disabled = false;
    }

    timeLeft--;
  }, 1000);
}
