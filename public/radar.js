document.addEventListener("DOMContentLoaded", function () {
  const radarContainer = document.getElementById("radar-container");
  const sweepDuration = 6000;

  const pingLogos = [
    { src: "bitmart_logo.png", link: "https://www.bitmart.com/" },
    { src: "solana_logo.png", link: "https://solana.com/" },
    { src: "robinhood_logo.png", link: "https://robinhood.com/" },
    { src: "gateio_logo.png", link: "https://gate.io/" },
    { src: "lbank_logo.png", link: "https://www.lbank.info/" },
    { src: "biconomy_logo.png", link: "https://biconomy.io/" },
    { src: "solcex_logo.png", link: "https://solcex.com/" },
    { src: "kcex_logo.png", link: "https://www.kcex.com/" },
  ];

  // Logos kreisförmig platzieren
  const logoAngles = [];

  pingLogos.forEach((logo, i) => {
    const angleRad = (i / pingLogos.length) * 2 * Math.PI;
    const r = 40; // Prozent vom Container-Radius
    const x = 50 + r * Math.cos(angleRad);
    const y = 50 + r * Math.sin(angleRad);

    const img = document.createElement("img");
    img.src = logo.src;
    img.alt = "Radar Icon";
    img.className = "radar-logo";
    img.style.left = `${x}%`;
    img.style.top = `${y}%`;

    img.addEventListener("click", () => window.open(logo.link, "_blank"));
    radarContainer.appendChild(img);

    // Berechne den Winkel in Grad (für Sweep-Abgleich)
    const angleDeg = (angleRad * 180 / Math.PI + 360) % 360;
    logoAngles.push({ el: img, angle: angleDeg });
  });

  // Sweep-Funktion
  function updateSweep() {
    const now = performance.now();
    const progress = (now % sweepDuration) / sweepDuration;
    const sweepAngle = progress * 360;

    logoAngles.forEach(({ el, angle }) => {
      const diff = Math.abs(sweepAngle - angle);
      const angleDiff = Math.min(diff, 360 - diff);

      if (angleDiff < 12) {
        el.classList.add("highlighted");
      } else {
        el.classList.remove("highlighted");
      }
    });

    requestAnimationFrame(updateSweep);
  }

  updateSweep();
});
