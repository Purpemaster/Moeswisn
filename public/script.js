const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";

const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";

const goalUSD1 = 20000;

// 🌐 Neue funktionierende Radio-Streams + Icons
const radioStations = [
  { stream: "https://stream.dnbradio.com/stream.mp3", icon: "drum_and_bass_icon.png" },
  { stream: "https://stream.realpunkradio.com:8000/live", icon: "skate_punk_icon.png" },
  { stream: "https://stream.reggae141.com:8000/stream", icon: "reggae_icon.png" },
  { stream: "https://stream.laut.fm/oldschool", icon: "hip_hop_icon.png" },
  { stream: "https://stream.laut.fm/metalradio", icon: "heavy_metal_icon.png" },
  { stream: "https://stream.laut.fm/house", icon: "house_icon.png" },
  { stream: "https://stream.laut.fm/electropop", icon: "electro_icon.png" },
  { stream: "https://us4.internet-radio.com/proxy/countryradio?mp=/stream", icon: "country_icon.png" },
  { stream: "https://us3.internet-radio.com/proxy/977thehits?mp=/stream", icon: "pop_music_icon.png" },
  { stream: "https://stream.folkalley.com/folkalley", icon: "folk_music_icon.png" },
  { stream: "https://stream.gothville.com:8000/gothville", icon: "gothic_icon.png" },
  { stream: "https://stream.jazz24.org/jazz24.mp3", icon: "jazz_soul_icon.png" }
];

// ⏳ Splash ausblenden
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
  }, 2000);
});

// 💰 Preis-APIs
async function fetchSolPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await res.json();
    return data.solana.usd || 0;
  } catch {
    return 0;
  }
}

async function fetchPurpePriceUSD() {
  try {
    const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${RAYDIUM_POOL}`);
    const data = await res.json();
    return parseFloat(data.data.attributes.base_token_price_usd);
  } catch {
    return 0;
  }
}

// 📊 Wallet-Daten
async function fetchWalletBalances() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();
    const solBalance = (data.nativeBalance || 0) / 1e9;

    const purpeToken = data.tokens?.find(t => t.mint === PURPE_MINT);
    const purpeBalance = purpeToken ? purpeToken.amount / Math.pow(10, purpeToken.decimals || 6) : 0;

    return { solBalance, purpeBalance };
  } catch {
    return { solBalance: 0, purpeBalance: 0 };
  }
}

// 📈 Fortschritt aktualisieren
function updateProgress(totalUSD) {
  const percent = Math.min((totalUSD / goalUSD1) * 100, 100);
  document.getElementById("progress-fill-1").style.width = `${percent}%`;
  document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
}

// 🔁 Tracker aktualisieren
async function updateTracker() {
  const [wallet, solPrice, purpePriceUSD] = await Promise.all([
    fetchWalletBalances(),
    fetchSolPrice(),
    fetchPurpePriceUSD()
  ]);

  const totalUSD = (wallet.solBalance * solPrice) + (wallet.purpeBalance * purpePriceUSD);
  updateProgress(totalUSD);

  const now = new Date();
  const formatted = now.toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short"
  });
  document.getElementById("last-updated").textContent = `Latest Update: ${formatted}`;
}

// 💸 Spenden
function setupDonationButtons() {
  document.getElementById("donate-sol").addEventListener("click", () => {
    const link = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
    window.location.href = link;
  });

  document.getElementById("donate-purpe").addEventListener("click", () => {
    const link = `solana:${walletAddress}?amount=3000000&spl-token=${PURPE_MINT}&label=Purple%20Pepe%20Donation`;
    window.location.href = link;
  });
}

// 📋 Adresse kopieren
function setupCopyButton() {
  document.getElementById("copy-button").addEventListener("click", () => {
    const address = document.getElementById("wallet-address").textContent.trim();
    navigator.clipboard.writeText(address)
      .then(() => alert("Wallet address copied!"))
      .catch(() => alert("Copy failed."));
  });
}

// 📻 Radio-Buttons mit Rotation + Stop
function setupRadioButtons() {
  const container = document.getElementById("radio-buttons");
  const player = document.getElementById("radio-player");
  let currentIcon = null;

  radioStations.forEach((station, index) => {
    const img = document.createElement("img");
    img.src = station.icon;
    img.className = "radio-icon";
    img.alt = `Station ${index + 1}`;
    img.addEventListener("click", () => {
      document.querySelectorAll(".radio-icon").forEach(el => el.classList.remove("active"));
      if (player.src !== station.stream) {
        player.src = station.stream;
        player.play();
        img.classList.add("active");
        currentIcon = img;
      } else {
        player.pause();
        player.src = "";
        currentIcon = null;
      }
    });
    container.appendChild(img);
  });
}

// 🎯 Start
updateTracker();
setInterval(updateTracker, 30000);
setupDonationButtons();
setupCopyButton();
setupRadioButtons();

// 📷 QR-Code
new QRious({
  element: document.getElementById('wallet-qr'),
  value: `solana:${walletAddress}`,
  size: 200,
  background: 'white',
  foreground: '#8000ff'
});
