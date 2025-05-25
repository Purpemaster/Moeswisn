const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";
const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";
const goalUSD1 = 20000;

// 🌍 Radio-Streams über Proxy
const radioStations = [
  { stream: "/proxy/https%3A%2F%2Fstream.dnbradio.com%2Fstream", icon: "drum_and_bass_icon.png" },
  { stream: "/proxy/https%3A%2F%2Fstreams.fluxfm.de%2Freggae%2Faac-64%2Fstream.mp3", icon: "reggae_icon.png" },
  { stream: "/proxy/https%3A%2F%2Fhiphop.radiostream321.com%2Fstream", icon: "hip_hop_icon.png" },
  { stream: "/proxy/https%3A%2F%2Fstream.laut.fm%2Fgothicworld", icon: "gothic_icon.png" },
  { stream: "/proxy/https%3A%2F%2Fstreaming.live365.com%2Fa11124", icon: "skate_punk_icon.png" },
  { stream: "/proxy/https%3A%2F%2Fais-sa2.cdnstream1.com%2F2448_192.mp3", icon: "country_icon.png" },
  { stream: "/proxy/https%3A%2F%2Fstream.laut.fm%2Ffolkradio", icon: "folk_music_icon.png" },
  { stream: "/proxy/https%3A%2F%2Fstream.laut.fm%2Fpop", icon: "pop_music_icon.png" },         // funktioniert
  { stream: "/proxy/https%3A%2F%2Fstream.laut.fm%2Felectropop", icon: "electro_icon.png" },     // funktioniert
  { stream: "/proxy/https%3A%2F%2Fstream.laut.fm%2Fhouse", icon: "house_icon.png" },            // funktioniert
  { stream: "/proxy/https%3A%2F%2Fstream.laut.fm%2Fmetalradio", icon: "heavy_metal_icon.png" }, // funktioniert
  { stream: "/proxy/https%3A%2F%2Fjazz-wr09.ice.infomaniak.ch%2Fjazz-wr09-128.mp3", icon: "jazz_soul_icon.png" }
];

// 📷 QR-Code generieren
new QRious({
  element: document.getElementById('wallet-qr'),
  value: `solana:${walletAddress}`,
  size: 200,
  background: 'white',
  foreground: '#8000ff'
});

// Splash ausblenden
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
  }, 2000);
});

// 📈 Preis-APIs
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

// 📊 Wallet Balance
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

// 🟣 Fortschritt
function updateProgress(totalUSD) {
  const percent = Math.min((totalUSD / goalUSD1) * 100, 100);
  document.getElementById("progress-fill-1").style.width = `${percent}%`;
  document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
}

// 🔄 Tracker
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
    window.location.href = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
  });

  document.getElementById("donate-purpe").addEventListener("click", () => {
    window.location.href = `solana:${walletAddress}?amount=3000000&spl-token=${PURPE_MINT}&label=Purple%20Pepe%20Donation`;
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

// 📻 Radio Player
function setupRadioButtons() {
  const container = document.getElementById("radio-buttons");
  const player = document.getElementById("radio-player");

  radioStations.forEach((station, index) => {
    const img = document.createElement("img");
    img.src = station.icon;
    img.className = "radio-icon";
    img.alt = `Station ${index + 1}`;
    img.addEventListener("click", () => {
      document.querySelectorAll(".radio-icon").forEach(el => el.classList.remove("active"));
      img.classList.add("active");
      player.src = station.stream;
      player.play().catch(console.error);
    });
    container.appendChild(img);
  });
}

// 🔁 Init
updateTracker();
setInterval(updateTracker, 30000);
setupDonationButtons();
setupCopyButton();
setupRadioButtons();
