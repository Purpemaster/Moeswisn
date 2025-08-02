document.addEventListener("DOMContentLoaded", () => {
  const radar = document.querySelector(".radar");
  const sweepDuration = 6000;

  const pingLogos = [
    { src: "bitmart_logo.png", link: "https://www.bitmart.com/" },
    { src: "solana_logo.png", link: "https://slingshot.app/" },
    { src: "robinhood_logo.png", link: "https://www.robinhood.com/" },
    { src: "gateio_logo.png", link: "https://www.gate.io/" },
    { src: "lbank_logo.png", link: "https://www.lbank.com/" },
    { src: "biconomy_logo.png", link: "https://www.biconomy.io/" },
    { src: "solcex_logo.png", link: "https://solcex.com/" },
    { src: "kcex_logo.png", link: "https://www.kcex.com/" }
  ];

  const radarRect = radar.getBoundingClientRect();
  const centerX = radar.offsetWidth / 2;
  const centerY = radar.offsetHeight / 2;
  const radius = radar.offsetWidth * 0.35;

  const logoAngles = [];

  pingLogos.forEach((logo, i) => {
    const angleRad = (i / pingLogos.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angleRad) - 25;
    const y = centerY + radius * Math.sin(angleRad) - 25;

    const img = document.createElement("img");
    img.src = logo.src;
    img.alt = "Exchange Logo";
    img.className = "radar-logo";
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    img.addEventListener("click", () => {
      window.open(logo.link, "_blank");
    });

    radar.appendChild(img);

    const angleDeg = (angleRad * 180 / Math.PI + 360) % 360;
    logoAngles.push({ el: img, angle: angleDeg });
  });

  function updateSweep() {
    const now = performance.now();
    const sweepAngle = ((now % sweepDuration) / sweepDuration) * 360;

    logoAngles.forEach(({ el, angle }) => {
      const diff = Math.abs(sweepAngle - angle);
      const angleDiff = Math.min(diff, 360 - diff);

      if (angleDiff < 20) {
        el.classList.add("highlighted");
      } else {
        el.classList.remove("highlighted");
      }
    });

    requestAnimationFrame(updateSweep);
  }

  updateSweep();
});
