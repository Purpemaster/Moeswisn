const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";
const PURPE_MINT = "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL";
const RAYDIUM_POOL = "CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj";
const goalUSD1 = 20000;

new QRious({
  element: document.getElementById('wallet-qr'),
  value: `solana:${walletAddress}`,
  size: 200,
  background: 'white',
  foreground: '#8000ff'
});

window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('splash').style.display = 'none', 3000);
});

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

async function fetchWalletBalances() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();
    const tokens = data.tokens || [];
    const solBalance = (data.nativeBalance || 0) / 1e9;
    const purpeToken = tokens.find(t => t.mint === PURPE_MINT);
    const purpeBalance = purpeToken ? purpeToken.amount / Math.pow(10, purpeToken.decimals || 6) : 0;
    return { solBalance, purpeBalance };
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
  const [wallet, solPrice, purpePriceUSD] = await Promise.all([
    fetchWalletBalances(),
    fetchSolPrice(),
    fetchPurpePriceUSD()
  ]);
  const solUSD = wallet.solBalance * solPrice;
  const purpeUSD = wallet.purpeBalance * purpePriceUSD;
  updateProgress(solUSD + purpeUSD);
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" });
  document.getElementById("last-updated").textContent = `Latest Update: ${now}`;
}

document.getElementById("donate-sol").onclick = () => {
  window.location.href = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
};
document.getElementById("donate-purpe").onclick = () => {
  window.location.href = `solana:${walletAddress}?amount=3000000&spl-token=${PURPE_MINT}&label=Purple%20Pepe%20Donation`;
};
document.getElementById("copy-button").onclick = () => {
  navigator.clipboard.writeText(walletAddress).then(() => alert("Wallet address copied!"));
};

// 🎧 Radio
const stations = [
  { name: "Drum & Bass", icon: "drum_and_bass_icon.png", stream: "https://stream.radioparadise.com/dnb-320" },
  { name: "Skate Punk", icon: "skate_punk_icon.png", stream: "https://punkrockers-radio.de:8000/128" },
  { name: "Reggae", icon: "reggae_icon.png", stream: "https://uk4.internet-radio.com:8276/stream" },
  { name: "Hip Hop", icon: "hip_hop_icon.png", stream: "https://radio.streemlion.com:1830/stream" },
  { name: "Heavy Metal", icon: "heavy_metal_icon.png", stream: "https://stream.laut.fm/metalradio" },
  { name: "House", icon: "house_icon.png", stream: "https://stream.laut.fm/house" },
  { name: "Electro", icon: "electro_icon.png", stream: "https://stream.laut.fm/electropop" },
  { name: "Country", icon: "country_icon.png", stream: "https://stream.radioparadise.com/country-320" },
  { name: "Folk", icon: "folk_music_icon.png", stream: "https://stream.laut.fm/folkradio" },
  { name: "Pop", icon: "pop_music_icon.png", stream: "https://stream.laut.fm/pop" },
  { name: "Gothic", icon: "gothic_icon.png", stream: "https://stream.laut.fm/gothicrock" },
  { name: "Jazz & Soul", icon: "jazz_soul_icon.png", stream: "https://stream.radioparadise.com/mellow-320" }
];

const player = document.getElementById("radio-player");
const container = document.getElementById("radio-buttons");

stations.forEach((station, index) => {
  const img = document.createElement("img");
  img.src = station.icon;
  img.alt = station.name;
  img.className = "radio-icon";
  img.onclick = () => {
    document.querySelectorAll(".radio-icon").forEach(el => el.classList.remove("active"));
    img.classList.add("active");
    player.src = station.stream;
    player.play();
  };
  container.appendChild(img);
});

updateTracker();
setInterval(updateTracker, 30000);
