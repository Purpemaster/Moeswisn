const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";

const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";

const goalUSD1 = 20000;
const proxyBase = "https://purple-pepe-proxy.onrender.com/proxy/";

// 🌐 Radio-Streams (Proxy funktioniert nur bei erlaubten Headern)
const radioStations = [
  { stream: proxyBase + encodeURIComponent("https://dnb.underground.fm:443/live"), icon: "drum_and_bass_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://streams.radio.co/s98b27fa6b/listen"), icon: "skate_punk_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://reggae141.radioca.st/stream"), icon: "reggae_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://stream.laut.fm/oldschool"), icon: "hip_hop_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://stream.laut.fm/metalradio"), icon: "heavy_metal_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://stream.laut.fm/house"), icon: "house_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://stream.laut.fm/electropop"), icon: "electro_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://stream.laut.fm/countryrocks"), icon: "country_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://stream.laut.fm/folkradio"), icon: "folk_music_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://stream.laut.fm/pop"), icon: "pop_music_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://stream.laut.fm/gothicrock"), icon: "gothic_icon.png" },
  { stream: proxyBase + encodeURIComponent("https://streaming.exclusive.radio/er-jazz-128"), icon: "jazz_soul_icon.png" }
];

// 🎧 Radio-Buttons Setup
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
      player.pause();
      player.src = station.stream;
      player.load();
      player.play().catch(e => console.error("Playback Error:", e));
    });
    container.appendChild(img);
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

// 💸 Spenden
function setupDonationButtons() {
  document.getElementById("donate-sol").addEventListener("click", () => {
    window.location.href = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
  });

  document.getElementById("donate-purpe").addEventListener("click", () => {
    window.location.href = `solana:${walletAddress}?amount=3000000&spl-token=${PURPE_MINT}&label=Purple%20Pepe%20Donation`;
  });
}

// 🔁 Fortschrittsanzeige
function updateProgress(totalUSD) {
  const percent = Math.min((totalUSD / goalUSD1) * 100, 100);
  document.getElementById("progress-fill-1").style.width = `${percent}%`;
  document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
}

// 🔍 Preise laden
async function fetchSolPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await res.json();
    return data.solana?.usd || 0;
  } catch {
    return 0;
  }
}

async function fetchPurpePriceUSD() {
  try {
    const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${RAYDIUM_POOL}`);
    const data = await res.json();
    return parseFloat(data.data?.attributes?.base_token_price_usd) || 0;
  } catch {
    return 0;
  }
}

// 🧾 Wallet-Daten
async function fetchWalletBalances() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();
    const solBalance = (data.nativeBalance || 0) / 1e9;
    const purpeToken = data.tokens?.find(t => t.mint === PURPE_MINT);
    const purpeBalance = purpeToken ? purpeToken.amount / 10 ** (purpeToken.decimals || 6) : 0;
    return { solBalance, purpeBalance };
  } catch {
    return { solBalance: 0, purpeBalance: 0 };
  }
}

// 🕒 Tracker starten
async function updateTracker() {
  const [wallet, solPrice, purpePriceUSD] = await Promise.all([
    fetchWalletBalances(),
    fetchSolPrice(),
    fetchPurpePriceUSD()
  ]);

  const totalUSD = (wallet.solBalance * solPrice) + (wallet.purpeBalance * purpePriceUSD);
  updateProgress(totalUSD);

  const now = new Date();
  document.getElementById("last-updated").textContent =
    `Letztes Update: ${now.toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    })}`;
}

// 🔳 QR-Code
new QRious({
  element: document.getElementById('wallet-qr'),
  value: `solana:${walletAddress}`,
  size: 200,
  background: 'white',
  foreground: '#8000ff'
});

// ✅ Initialisierung
updateTracker();
setInterval(updateTracker, 30000);
setupRadioButtons();
setupDonationButtons();
setupCopyButton();
