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
    ping.style.transition = 'opacity 0.2s ease-in-out';
    ping.style.cursor = 'pointer';

    if (iconLinks[id]) {
      ping.addEventListener("click", () => {
        window.open(iconLinks[id], "_blank");
      });
    }
  });

  function getAngle(el) {
    const radar = document.querySelector('.radar');
    const radarRect = radar.getBoundingClientRect();
    const cx = radarRect.left + radarRect.width / 2;
    const cy = radarRect.top + radarRect.height / 2;

    const rect = el.getBoundingClientRect();
    const ex = rect.left + rect.width / 2;
    const ey = rect.top + rect.height / 2;

    const dx = ex - cx;
    const dy = ey - cy;
    const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    return angle;
  }

  const pingAngles = Array.from(pings).map(ping => ({
    el: ping,
    angle: getAngle(ping)
  }));

  function updateSweep() {
    const now = performance.now();
    const progress = (now % sweepDuration) / sweepDuration;
    const sweepAngle = progress * 360;

    pingAngles.forEach(({ el, angle }) => {
      const diff = Math.abs(sweepAngle - angle);
      const angleDiff = Math.min(diff, 360 - diff);

      if (angleDiff < 12) {
        el.style.opacity = 1;
      } else {
        el.style.opacity = 0;
      }
    });

    requestAnimationFrame(updateSweep);
  }

  updateSweep();
});
