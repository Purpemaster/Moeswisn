// radar.js

setInterval(() => {
  const sweep = document.querySelector(".sweep");
  const angle = (Date.now() / 1000 * 60) % 360;

  document.querySelectorAll(".ping").forEach(ping => {
    const rect = ping.getBoundingClientRect();
    const radar = document.querySelector(".radar").getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - (radar.left + radar.width / 2);
    const dy = rect.top + rect.height / 2 - (radar.top + radar.height / 2);
    const deg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;

    const inRange = Math.abs(deg - angle) < 18 || Math.abs(deg - angle + 360) < 18 || Math.abs(deg - angle - 360) < 18;
    if (inRange) {
      ping.classList.add("visible");
    } else {
      ping.classList.remove("visible");
    }
  });
}, 100);
