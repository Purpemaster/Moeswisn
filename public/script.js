const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";

const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";

const goalUSD1 = 20000;

// 🌐 Radio-Streams (ohne Proxy, getestet & öffentlich)
const radioStations = [
  // Drum & Bass
  { stream: "https://stream.dnbradio.com/dnb.mp3", icon: "drum_and_bass_icon.png" },

  // Jazz & Soul
  { stream: "https://live.wostreaming.net/direct/knkx-jazz24mp3-ibc1", icon: "jazz_soul_icon.png" },

  // Reggae
  { stream: "https://reggae141.radioca.st/stream", icon: "reggae_icon.png" },

  // Hip Hop
  { stream: "https://live.powerhitz.com/hot108?aw_0_req.gdpr=true", icon: "hip_hop_icon.png" },

  // Gothic
  { stream: "https://ais-sa2.cdnstream1.com/2398_128.mp3", icon: "gothic_icon.png" }, // GothVille Radio

  // Skate Punk
  { stream: "https://uk1.internet-radio.com/proxy/realpunkradio?mp=/stream", icon: "skate_punk_icon.png" },

  // Country
  { stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/KEANFM.mp3", icon: "country_icon.png" },

  // Folk Music
  { stream: "https://stream.srg-ssr.ch/m/rsj/mp3_128", icon: "folk_music_icon.png" },

  // Deine funktionierenden Sender:
  { stream: "https://stream.laut.fm/house", icon: "house_icon.png" },
  { stream: "https://stream.laut.fm/electropop", icon: "electro_icon.png" },
  { stream: "https://stream.laut.fm/metalradio", icon: "heavy_metal_icon.png" },
  { stream: "https://stream.laut.fm/pop", icon: "pop_music_icon.png" }
];

// 🎧 Radio-Buttons
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
      player.play().catch(e => console.error("🔈 Playback Error:", e));
    });
    container.appendChild(img);
  });
}

// 📋 Wallet-Adresse kopieren
function setupCopyButton() {
  document.getElementById("copy-button").addEventListener("click", () => {
    const address = document.getElementById("wallet-address").textContent.trim();
    navigator.clipboard.writeText(address)
      .then(() => alert("Wallet-Adresse kopiert!"))
      .catch(() => alert("Fehler beim Kopieren."));
  });
}

// 💸 Spenden-Links
function setupDonationButtons() {
  document.getElementById("donate-sol").addEventListener("click", () => {
    window.location.href = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
  });

  document.getElementById("donate-purpe").addEventListener("click", () => {
    window.location.href = `solana:${walletAddress}?amount=3000000&spl-token=${PURPE_MINT}&label=Purple%20Pepe%20Donation`;
  });
}

// 📈 Fortschritt aktualisieren
function updateProgress(totalUSD) {
  const percent = Math.min((totalUSD / goalUSD1) * 100, 100);
  document.getElementById("progress-fill-1").style.width = `${percent}%`;
  document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
}

// 🔎 SOL & PURPE Preise
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

// 🧾 Wallet-Daten abrufen
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

// 🕒 Tracker regelmäßig aktualisieren
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

// 🔳 QR-Code generieren
new QRious({
  element: document.getElementById('wallet-qr'),
  value: `solana:${walletAddress}`,
  size: 200,
  background: 'white',
  foreground: '#8000ff'
});

// ✅ Start
updateTracker();
setInterval(updateTracker, 30000);
setupRadioButtons();
setupDonationButtons();
setupCopyButton();
