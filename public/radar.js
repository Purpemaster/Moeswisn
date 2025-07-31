document.addEventListener("DOMContentLoaded", function () {
  const sweepDuration = 6000;
  const pings = document.querySelectorAll('.ping');

  const iconLinks = {
    "ping1": "https://www.bitmart.com/",
    "ping3": "https://slingshot.finance/",
    "ping4": "https://biconomy.io/",
    "ping6": "https://www.kcex.com/",
    "ping7": "https://www.lbank.info/",
    "ping9": "https://gate.io/",
    "ping10": "https://solcex.com/",
    "ping11": "https://robinhood.com/"
  };

  pings.forEach(ping => {
    const id = ping.classList[1];
    ping.style.opacity = 0;
    ping.style.transition = 'opacity 0.3s ease-in-out';
    ping.style.cursor = 'pointer';

    if (iconLinks[id]) {
      ping.addEventListener("click", () => {
        window.open(iconLinks[id], "_blank");
      });
    }
  });

  // Warten bis das Radar gerendert ist
  setTimeout(() => {
    const radar = document.querySelector('.radar');
    const radarRect = radar.getBoundingClientRect();
    const cx = radarRect.left + radarRect.width / 2;
    const cy = radarRect.top + radarRect.height / 2;

    const pingAngles = Array.from(pings).map(ping => {
      const rect = ping.getBoundingClientRect();
      const ex = rect.left + rect.width / 2;
      const ey = rect.top + rect.height / 2;
      const dx = ex - cx;
      const dy = ey - cy;
      const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;

      return { el: ping, angle };
    });

    function updateSweep() {
      const now = performance.now();
      const progress = (now % sweepDuration) / sweepDuration;
      const sweepAngle = progress * 360;

      pingAngles.forEach(({ el, angle }) => {
        const diff = Math.abs(sweepAngle - angle);
        const angleDiff = Math.min(diff, 360 - diff);

        // Show ping if within sweep angle
        if (angleDiff < 20) {
          el.style.opacity = 1;
        } else {
          el.style.opacity = 0;
        }
      });

      requestAnimationFrame(updateSweep);
    }

    updateSweep();
  }, 200); // Kurze Verzögerung bis Radar sichtbar ist
});
