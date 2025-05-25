const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";

const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";

const goalUSD1 = 20000;

// 🌐 Radio-Streams + Icons
const radioStations = [
  { stream: "https://uk4.internet-radio.com:8276/stream", icon: "drum_and_bass_icon.png" },
  { stream: "https://stream.rockradio.com/rock", icon: "skate_punk_icon.png" },
  { stream: "https://reggae141.radioca.st/stream", icon: "reggae_icon.png" },
  { stream: "https://stream.laut.fm/oldschool", icon: "hip_hop_icon.png" },
  { stream: "https://stream.laut.fm/metalradio", icon: "heavy_metal_icon.png" },
  { stream: "https://stream.laut.fm/house", icon: "house_icon.png" },
  { stream: "https://stream.laut.fm/electropop", icon: "electro_icon.png" },
  { stream: "https://stream.radioparadise.com/country-320", icon: "country_icon.png" },
  { stream: "https://stream.laut.fm/folkradio", icon: "folk_music_icon.png" },
  { stream: "https://stream.laut.fm/pop", icon: "pop_music_icon.png" },
  { stream: "https://stream.laut.fm/gothicrock", icon: "gothic_icon.png" },
  { stream: "https://stream.radioparadise.com/mellow-320", icon: "jazz_soul_icon.png" }
];

// 📦 Splash ausblenden
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
  }, 2000);
});

// 📉 Preis-APIs
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

// 🧾 Wallet Balances
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

// 🔁 Fortschritt aktualisieren
function updateProgress(totalUSD) {
  const percent = Math.min((totalUSD / goalUSD1) * 100, 100);
  document.getElementById("progress-fill-1").style.width = `${percent}%`;
  document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
}

// 🕒 Tracker aktualisieren
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

// 💸 Donation-Buttons
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

// 📋 Copy-Adresse
function setupCopyButton() {
  document.getElementById("copy-button").addEventListener("click", () => {
    const address = document.getElementById("wallet-address").textContent.trim();
    navigator.clipboard.writeText(address)
      .then(() => alert("Wallet address copied!"))
      .catch(() => alert("Copy failed."));
  });
}

// 📻 Radio-Buttons mit Stopp-Funktion
function setupRadioButtons() {
  const container = document.getElementById("radio-buttons");
  const player = document.getElementById("radio-player");
  let currentActiveIcon = null;

  radioStations.forEach((station, index) => {
    const img = document.createElement("img");
    img.src = station.icon;
    img.className = "radio-icon";
    img.alt = `Station ${index + 1}`;

    img.addEventListener("click", () => {
      const isSame = currentActiveIcon === img;
      document.querySelectorAll(".radio-icon").forEach(el => el.classList.remove("active"));

      if (isSame) {
        player.pause();
        player.src = "";
        currentActiveIcon = null;
      } else {
        img.classList.add("active");
        player.src = station.stream;
        player.play();
        currentActiveIcon = img;
      }
    });

    container.appendChild(img);
  });
}

// 🔁 Initialisierung
updateTracker();
setInterval(updateTracker, 30000);
setupDonationButtons();
setupCopyButton();
setupRadioButtons();

// 📷 QR-Code generieren
new QRious({
  element: document.getElementById('wallet-qr'),
  value: `solana:${walletAddress}`,
  size: 200,
  background: 'white',
  foreground: '#8000ff'
});
