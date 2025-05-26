const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";
const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";
const goalUSD1 = 20000;

const radioStations = [
  { stream: "https://stream.laut.fm/house", icon: "house_icon.png" },
  { stream: "https://stream.laut.fm/metalradio", icon: "heavy_metal_icon.png" },
  { stream: "https://stream.laut.fm/pop", icon: "pop_music_icon.png" },
  { stream: "https://stream.laut.fm/electropop", icon: "electro_icon.png" },
  { stream: "http://ice.bassdrive.net/stream56", icon: "drum_and_bass_icon.png" },
  { stream: "https://live.amperwave.net/direct/ppm-jazz24mp3-ibc1", icon: "jazz_soul_icon.png" },
  { stream: "https://stream.laut.fm/jahfari", icon: "reggae_icon.png" },
  { stream: "https://stream.laut.fm/gothic-radio-saar", icon: "gothic_icon.png" },
  { stream: "https://stream.laut.fm/aufden-punk-t", icon: "skate_punk_icon.png" },
  { stream: "https://stream.laut.fm/volksmusikradio", icon: "folk_music_icon.png" },
  { stream: "https://stream.laut.fm/hip-hop-fm", icon: "hip_hop_icon.png" },
  { stream: "https://stream.laut.fm/country-fm24", icon: "country_icon.png" }
];

function setupRadioButtons() {
  const container = document.getElementById("radio-buttons");
  const player = document.getElementById("radio-player");

  radioStations.forEach((station, index) => {
    const img = document.createElement("img");
    img.src = station.icon;
    img.className = "radio-icon";
    img.alt = `Station ${index}`;
    img.addEventListener("click", () => {
      const isActive = img.classList.contains("active");
      document.querySelectorAll(".radio-icon").forEach(el => el.classList.remove("active"));
      if (!isActive) {
        img.classList.add("active");
        player.src = station.stream;
        player.play().catch(console.error);
      } else {
        player.pause();
        player.src = "";
      }
    });
    container.appendChild(img);
  });
}

function toggleVisibility(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function setupCopyButton() {
  document.getElementById("copy-button").addEventListener("click", () => {
    const address = document.getElementById("wallet-address").textContent.trim();
    navigator.clipboard.writeText(address)
      .then(() => alert("Wallet address copied!"))
      .catch(() => alert("Copy failed."));
  });
}

function setupDonationButtons() {
  document.getElementById("donate-sol").addEventListener("click", () => {
    window.location.href = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
  });

  document.getElementById("donate-purpe").addEventListener("click", () => {
    window.location.href = `solana:${walletAddress}?amount=3000000&spl-token=${PURPE_MINT}&label=Purple%20Pepe%20Donation`;
  });
}

async function fetchSolPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await res.json();
    return data.solana.usd || 0;
  } catch { return 0; }
}

async function fetchPurpePriceUSD() {
  try {
    const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${RAYDIUM_POOL}`);
    const data = await res.json();
    return parseFloat(data.data.attributes.base_token_price_usd);
  } catch { return 0; }
}

async function fetchWalletBalances() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();
    const sol = (data.nativeBalance || 0) / 1e9;
    const purpeToken = data.tokens?.find(t => t.mint === PURPE_MINT);
    const purpe = purpeToken ? purpeToken.amount / Math.pow(10, purpeToken.decimals || 6) : 0;
    return { solBalance: sol, purpeBalance: purpe };
  } catch {
    return { solBalance: 0, purpeBalance: 0 };
  }
}

function updateProgress(totalUSD) {
  const percent = Math.min((totalUSD / goalUSD1) * 100, 100);
  document.getElementById("progress-fill-1").style.width = `${percent}%`;
  document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
}

async function updateTracker() {
  const [wallet, solPrice, purpePrice] = await Promise.all([
    fetchWalletBalances(), fetchSolPrice(), fetchPurpePriceUSD()
  ]);
  const totalUSD = wallet.solBalance * solPrice + wallet.purpeBalance * purpePrice;
  updateProgress(totalUSD);

  const now = new Date();
  document.getElementById("last-updated").textContent =
    now.toLocaleTimeString("en-US", { timeZone: "UTC", hour12: false });
}

new QRious({
  element: document.getElementById("wallet-qr"),
  value: `solana:${walletAddress}`,
  size: 200,
  background: "white",
  foreground: "#8000ff"
});

updateTracker();
setInterval(updateTracker, 30000);
setupRadioButtons();
setupCopyButton();
setupDonationButtons();
