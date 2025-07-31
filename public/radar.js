document.addEventListener("DOMContentLoaded", function () {
  const sweepDuration = 6000;

  const pings = document.querySelectorAll('.ping');

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

  const radar = document.querySelector('.radar');
  const radarRect = radar.getBoundingClientRect();
  const cx = radarRect.width / 2;
  const cy = radarRect.height / 2;

  function getAngleFromCenter(el) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - radarRect.left;
    const y = rect.top + rect.height / 2 - radarRect.top;
    const dx = x - cx;
    const dy = y - cy;
    const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    return angle;
  }

  const pingAngles = Array.from(pings).map(ping => {
    const angle = getAngleFromCenter(ping);
    const id = ping.classList[1];
    ping.style.opacity = 0;
    ping.style.transition = 'opacity 0.2s ease-in-out';
    ping.style.cursor = 'pointer';

    if (iconLinks[id]) {
      ping.addEventListener("click", () => {
        window.open(iconLinks[id], "_blank");
      });
    }

    return { el: ping, angle };
  });

  function updateSweep() {
    const now = performance.now();
    const progress = (now % sweepDuration) / sweepDuration;
    const sweepAngle = progress * 360;

    pingAngles.forEach(({ el, angle }) => {
      const diff = Math.abs(sweepAngle - angle);
      const angleDiff = Math.min(diff, 360 - diff);
      el.style.opacity = angleDiff < 15 ? 1 : 0;
    });

    requestAnimationFrame(updateSweep);
  }

  updateSweep();
});
