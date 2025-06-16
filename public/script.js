const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";
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

function toggleQR() {
  const el = document.getElementById("qr-container");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function toggleAddress() {
  const el = document.getElementById("address-container");
  el.style.display = el.style.display === "none" ? "flex" : "none";
}

function setupRadioButtons() {
  const container = document.getElementById("radio-buttons");
  const player = document.getElementById("radio-player");
  player.style.display = "none";

  radioStations.forEach(station => {
    const img = document.createElement("img");
    img.src = station.icon;
    img.className = "radio-icon";
    img.alt = "";

    img.addEventListener("click", () => {
      const active = img.classList.contains("active");
      document.querySelectorAll(".radio-icon").forEach(el => el.classList.remove("active"));
      if (!active) {
        img.classList.add("active");
        player.src = station.stream;
        player.play();
      } else {
        player.pause();
      }
    });

    container.appendChild(img);
  });
}

function setupCopyButton() {
  document.getElementById("copy-button").addEventListener("click", () => {
    navigator.clipboard.writeText(walletAddress)
      .then(() => alert("Wallet-Adresse kopiert!"))
      .catch(() => alert("Copy failed."));
  });
}

function setupDonationButtons() {
  document.getElementById("donate-sol").addEventListener("click", () => {
    window.location.href = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
  });
  document.getElementById("donate-purpe").addEventListener("click", () => {
    window.location.href = `solana:${walletAddress}?amount=3000000&spl-token=HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL&label=Purple%20Pepe%20Donation`;
  });
}

function updateProgress(totalUSD) {
  const percent1 = Math.min((totalUSD / goalUSD1) * 100, 100);
  const percent2 = totalUSD > goalUSD1
    ? Math.min(((totalUSD - goalUSD1) / (goalUSD2 - goalUSD1)) * 100, 100)
    : 0;

  document.getElementById("progress-fill-1").style.width = `${percent1}%`;
  document.getElementById("progress-fill-2").style.width = `${percent2}%`;
  document.getElementById("current-amount").textContent = `$${totalUSD.toFixed(2)}`;
}

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
    const res = await fetch("https://api.geckoterminal.com/api/v2/networks/solana/pools/CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj");
    const data = await res.json();
    return parseFloat(data.data?.attributes?.base_token_price_usd) || 0;
  } catch {
    return 0;
  }
}

async function fetchWalletBalances() {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
    const data = await res.json();
    const solBalance = (data.nativeBalance || 0) / 1e9;
    const purpeToken = data.tokens?.find(t => 
      t.mint === "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL"
    );
    const purpeBalance = purpeToken
      ? purpeToken.amount / 10 ** (purpeToken.decimals || 6)
      : 0;
    return { solBalance, purpeBalance };
  } catch {
    return { solBalance: 0, purpeBalance: 0 };
  }
}

async function updateTracker() {
  const [wallet, solPrice, purpePriceUSD] = await Promise.all([
    fetchWalletBalances(),
    fetchSolPrice(),
    fetchPurpePriceUSD()
  ]);
  const totalUSD = (wallet.solBalance * solPrice) + (wallet.purpeBalance * purpePriceUSD);
  updateProgress(totalUSD);
  document.getElementById("last-updated").textContent =
    new Date().toLocaleTimeString(undefined, { hour12: false });
}

new QRious({
  element: document.getElementById('wallet-qr'),
  value: `solana:${walletAddress}`,
  size: 200,
  background: 'white',
  foreground: '#8000ff'
});

function setupARTrigger() {
  const trigger = document.getElementById("purpe-ar-trigger");
  const viewer = document.getElementById("hidden-ar-model");
  if (!trigger || !viewer) return;

  trigger.addEventListener("click", async e => {
    e.preventDefault();
    try {
      await viewer.activateAR();
    } catch {
      window.location.href = trigger.href;
    }
  });
}

setupRadioButtons();
setupCopyButton();
setupDonationButtons();
updateTracker();
setInterval(updateTracker, 30000);
setupARTrigger();
