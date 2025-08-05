const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "bf688561-527e-43f9-a24e-add82f281a29";
const goalUSD1 = 20000;
const goalUSD2 = 100000;

const radioStations = [
  { stream: "https://stream.laut.fm/house", icon: "house_icon.png" },
  { stream: "https://stream.laut.fm/metalradio", icon: "heavy_metal_icon.png" },
  { stream: "https://stream.laut.fm/pop", icon: "pop_music_icon.png" },
  { stream: "https://stream.laut.fm/electropop", icon: "electro_icon.png" },
  { stream: "http://ice.bassdrive.net/stream56", icon: "drum_and_bass_icon.png" },
  { stream: "https://streaming.radio.co/s774887f7b/listen", icon: "jazz_soul_icon.png" },
  { stream: "https://stream.laut.fm/jahfari", icon: "reggae_icon.png" },
  { stream: "https://stream.laut.fm/gothic-radio-saar", icon: "gothic_icon.png" },
  { stream: "https://stream.laut.fm/aufden-punk-t", icon: "skate_punk_icon.png" },
  { stream: "https://stream.laut.fm/volksmusikradio", icon: "folk_music_icon.png" },
  { stream: "http://live.powerhitz.com/hot108?aw_0_req.gdpr=true", icon: "hip_hop_icon.png" },
  { stream: "https://strm112.1.fm/ccountry_mobile_mp3", icon: "country_icon.png" }
];

// ⛔ DSGVO Consent Handler (localStorage-basiert)
function requestConsent(callback) {
  const stored = localStorage.getItem("purpeConsent");
  if (stored === "accepted") return callback(true);
  if (stored === "declined") return callback(false);

  const overlay = document.getElementById("consent-overlay");
  overlay.style.display = "flex";

  document.getElementById("consent-accept").onclick = () => {
    overlay.style.display = "none";
    localStorage.setItem("purpeConsent", "accepted");
    callback(true);
  };

  document.getElementById("consent-decline").onclick = () => {
    overlay.style.display = "none";
    localStorage.setItem("purpeConsent", "declined");
    callback(false);
  };
}

// Toggle-Funktionen mit Consent
function toggleRadio() {
  requestConsent(consent => {
    if (consent) toggleSection("radio-container");
  });
}

function toggleChart() {
  requestConsent(consent => {
    if (consent) toggleSection("chart-container");
  });
}

function toggleSection(id) {
  const el = document.getElementById(id);
  el.style.display = (el.style.display === "none" || el.style.display === "") ? "block" : "none";
}

function toggleQR() { toggleSection("qr-container"); }
function toggleAddress() { toggleSection("address-container"); }
function toggleAR() { toggleSection("purpespace"); }
function toggleRadar() { toggleSection("radar-container"); }

function setupCopyButton() {
  document.getElementById("copy-button").addEventListener("click", () => {
    navigator.clipboard.writeText(walletAddress)
      .then(() => alert("Wallet-Adresse kopiert!"))
      .catch(() => alert("Fehler beim Kopieren"));
  });
}

function setupRadioButtons() {
  const container = document.getElementById("radio-buttons");
  const player = document.getElementById("radio-player");

  radioStations.forEach(s => {
    const img = document.createElement("img");
    img.src = s.icon;
    img.className = "radio-icon";
    img.addEventListener("click", () => {
      const isActive = img.classList.contains("active");
      document.querySelectorAll(".radio-icon").forEach(i => i.classList.remove("active"));
      if (isActive) {
        player.pause();
        player.src = "";
      } else {
        img.classList.add("active");
        player.src = s.stream;
        player.play();
      }
    });
    container.appendChild(img);
  });
}

function setupDonationButtons() {
  document.getElementById("donate-sol").onclick = () => {
    window.location.href = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
  };
  document.getElementById("donate-purpe").onclick = () => {
    window.location.href = `solana:${walletAddress}?amount=3000000&spl-token=HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL&label=Purple%20Pepe%20Donation`;
  };
}

function updateProgress(total) {
  const p1 = Math.min((total / goalUSD1) * 100, 100);
  const p2 = total > goalUSD1 ? Math.min(((total - goalUSD1) / (goalUSD2 - goalUSD1)) * 100, 100) : 0;
  document.getElementById("progress-fill-1").style.width = p1 + "%";
  document.getElementById("progress-fill-2").style.width = p2 + "%";
  document.getElementById("current-amount").textContent = `$${total.toFixed(2)}`;
}

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error("fetchJson error:", e);
    return null;
  }
}

async function fetchSolPrice() {
  const data = await fetchJson("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
  return data?.solana?.usd || 0;
}

async function fetchPurpePrice() {
  const data = await fetchJson("https://api.geckoterminal.com/api/v2/networks/solana/pools/CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj?embed=1");
  return parseFloat(data?.data?.attributes?.base_token_price_usd) || 0;
}

async function fetchBalance() {
  const data = await fetchJson(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
  const sol = (data?.nativeBalance || 0) / 1e9;
  const token = data?.tokens?.find(t => t.mint === "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL");
  const purpe = token ? token.amount / Math.pow(10, token.decimals || 1) : 0;
  return { sol, purpe };
}

async function updateTracker() {
  const [bal, solPrice, purpePrice] = await Promise.all([
    fetchBalance(),
    fetchSolPrice(),
    fetchPurpePrice()
  ]);
  const total = (bal.sol * solPrice) + (bal.purpe * purpePrice);
  updateProgress(total);
  document.getElementById("last-updated").textContent = new Date().toLocaleTimeString();
}

document.addEventListener("DOMContentLoaded", () => {
  setupRadioButtons();
  setupCopyButton();
  setupDonationButtons();
  updateTracker();
  setInterval(updateTracker, 30000);

  // AR MODELS
  fetch('ar_models.json')
    .then(response => response.json())
    .then(models => {
      const track = document.getElementById('carousel-track');
      models.forEach(model => {
        const div = document.createElement('div');
        div.className = 'carousel-item';
        div.innerHTML = `
          <img src="${model.img}" alt="${model.alt}" />
          <a href="${model.usdz}" rel="ar" class="ar-button">📱 iOS</a>
          <a href="${model.glb}" target="_blank" class="ar-button">🤖 Android</a>
        `;
        track.appendChild(div);
      });
    });

  // RADAR BLIPS
  const radarWrapper = document.getElementById("radar-container").querySelector(".radar");
  const pingLogos = [
    { src: "bitmart_logo.png", link: "https://www.bitmart.com/" },
    { src: "slingshot_logo.png", link: "https://slingshot.app/" },
    { src: "robinhood_logo.png", link: "https://robinhood.com/" },
    { src: "gateio_logo.png", link: "https://gate.io/" },
    { src: "lbank_logo.png", link: "https://www.lbank.info/" },
    { src: "biconomy_logo.png", link: "https://b1.biconomy.com/" },
    { src: "solcex_logo.png", link: "https://solcex.io/" },
    { src: "kcex_logo.png", link: "https://www.kcex.com/" }
  ];
  const logoAngles = [];
  const radarRadiusPercent = 40;
  const centerPercent = 50;
  const logoSize = 52;

  pingLogos.forEach((logo, i) => {
    const angleRad = (i / pingLogos.length) * 2 * Math.PI;
    const x = centerPercent + radarRadiusPercent * Math.cos(angleRad);
    const y = centerPercent + radarRadiusPercent * Math.sin(angleRad);

    const img = document.createElement("img");
    img.src = logo.src;
    img.alt = "Radar Icon";
    img.className = "radar-logo";
    img.style.position = "absolute";
    img.style.width = `${logoSize}px`;
    img.style.height = `${logoSize}px`;
    img.style.left = `calc(${x}% - ${logoSize/2}px)`;
    img.style.top = `calc(${y}% - ${logoSize/2}px)`;
    img.addEventListener("click", () => window.open(logo.link, "_blank"));

    radarWrapper.appendChild(img);
    logoAngles.push({ el: img, angle: (angleRad * 180/Math.PI + 360) % 360 });
  });

  function updateSweep() {
    const now = performance.now();
    const sweep = ((now % 6000) / 6000) * 360;
    logoAngles.forEach(({el, angle}) => {
      const diff = Math.abs(sweep - angle);
      const ad = Math.min(diff, 360-diff);
      el.classList.toggle("highlighted", ad < 10);
    });
    requestAnimationFrame(updateSweep);
  }
  updateSweep();
});

// QR Generator
new QRious({
  element: document.getElementById("wallet-qr"),
  value: `solana:${walletAddress}`,
  size: 200,
  background: "white",
  foreground: "#8000ff"
});
