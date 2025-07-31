document.addEventListener("DOMContentLoaded", function () {
  const sweepDuration = 6000; // must match CSS duration
  const radar = document.querySelector(".radar");
  const pings = document.querySelectorAll(".ping");

  const iconLinks = {
    "ping1": "https://www.bitmart.com/",
    "ping2": "https://latoken.com/",
    "ping3": "https://slingshot.finance/",
    "ping4": "https://biconomy.io/",
    "ping5": "https://poloniex.com/",
    "ping6": "https://www.kcex.com/",
    "ping7": "https://www.lbank.info/",
    "ping8": "https://www.superex.com/",
    "ping9": "https://gate.io/",
    "ping10": "https://solcex.com/",
    "ping11": "https://robinhood.com/"
  };

  const pingAngles = [];

  function getAngle(el) {
    const radarRect = radar.getBoundingClientRect();
    const cx = radarRect.left + radarRect.width / 2;
    const cy = radarRect.top + radarRect.height / 2;

    const rect = el.getBoundingClientRect();
    const ex = rect.left + rect.width / 2;
    const ey = rect.top + rect.height / 2;

    const dx = ex - cx;
    const dy = ey - cy;

    return (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
  }

  function calculatePingAngles() {
    pingAngles.length = 0;

    pings.forEach(ping => {
      const id = ping.classList[1]; // assumes "ping ping1", etc.
      ping.style.opacity = 0;
      ping.style.transition = "opacity 0.2s ease-in-out";
      ping.style.cursor = "pointer";

      if (iconLinks[id]) {
        ping.addEventListener("click", () => {
          window.open(iconLinks[id], "_blank");
        });
      }

      const angle = getAngle(ping);
      pingAngles.push({ el: ping, angle });
    });
  }

  function updateSweep() {
    const now = performance.now();
    const progress = (now % sweepDuration) / sweepDuration;
    const sweepAngle = progress * 360;

    pingAngles.forEach(({ el, angle }) => {
      const diff = Math.abs(sweepAngle - angle);
      const angleDiff = Math.min(diff, 360 - diff);

      if (angleDiff < 15) {
        el.style.opacity = 1;
      } else {
        el.style.opacity = 0;
      }
    });

    requestAnimationFrame(updateSweep);
  }

  // Radar might be hidden on load, wait for visibility
  const radarObserver = new MutationObserver(() => {
    if (radar.style.display !== "none") {
      calculatePingAngles();
      updateSweep();
      radarObserver.disconnect();
    }
  });

  radarObserver.observe(radar, { attributes: true, attributeFilter: ["style"] });
});
