const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const goalUSD1 = 20000, goalUSD2 = 100000;

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
  { stream: "https://strm112.1.fm/ccountry_mobile_mp3", icon: "country_icon.png" },
];

function toggleSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = (el.style.display === "none" || el.style.display === "") ? "block" : "none";
}

function toggleQR() { toggleSection("qr-container"); }
function toggleAddress() { toggleSection("address-container"); }
function toggleRadio() { toggleSection("radio-container"); }
function toggleAR() { toggleSection("purpespace"); }

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

function setupCopyButton() {
  document.getElementById("copy-button").addEventListener("click", () => {
    navigator.clipboard.writeText(walletAddress)
      .then(() => alert("Wallet-Adresse kopiert!"))
      .catch(() => alert("Fehler beim Kopieren"));
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
    const res = await fetch(url, { headers: { accept: "application/json" } });
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("❌ API returned non-JSON response:", text);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("🔥 fetchJson exploded:", err);
    return null;
  }
}

let lastSolPrice = 0;
let lastPurpePrice = 0;
let lastPriceFetch = 0;

async function fetchSolPrice() {
  const now = Date.now();
  if (now - lastPriceFetch < 5 * 60 * 1000 && lastSolPrice !== 0) return lastSolPrice;
  const d = await fetchJson("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
  lastSolPrice = d?.solana?.usd || 0;
  lastPriceFetch = now;
  return lastSolPrice;
}

async function fetchPurpePrice() {
  const now = Date.now();
  if (now - lastPriceFetch < 5 * 60 * 1000 && lastPurpePrice !== 0) return lastPurpePrice;
  const d = await fetchJson("https://api.geckoterminal.com/api/v2/networks/solana/pools/CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj");
  lastPurpePrice = parseFloat(d?.data?.attributes?.base_token_price_usd) || 0;
  lastPriceFetch = now;
  return lastPurpePrice;
}

async function fetchBalance() {
  const solUrl = `https://public-api.solscan.io/account/sol/${walletAddress}`;
  const tokenUrl = `https://public-api.solscan.io/account/tokens?address=${walletAddress}`;

  try {
    const [solData, tokenData] = await Promise.all([
      fetchJson(solUrl),
      fetchJson(tokenUrl)
    ]);

    if (!solData || !tokenData) {
      console.warn("⛔️ Keine Daten empfangen.");
      return { sol: 0, purpe: 0 };
    }

    const sol = parseFloat(solData.lamports) / 1e9;

    const purpeToken = tokenData.find(t =>
      t.tokenAddress === "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL"
    );

    const purpe = purpeToken?.tokenAmount?.uiAmount || 0;

    console.log("✅ fetched balances:", { sol, purpe });

    return { sol, purpe };
  } catch (err) {
    console.error("💥 Fehler beim Abrufen der Balance:", err);
    return { sol: 0, purpe: 0 };
  }
}

async function updateTracker() {
  const [bal, solP, purpeP] = await Promise.all([
    fetchBalance(),
    fetchSolPrice(),
    fetchPurpePrice()
  ]);
  const total = bal.sol * solP + bal.purpe * purpeP;
  console.log(`📊 SOL: $${(bal.sol * solP).toFixed(2)} | PURPE: $${(bal.purpe * purpeP).toFixed(2)} | Gesamt: $${total.toFixed(2)}`);
  updateProgress(total);
  document.getElementById("last-updated").textContent = new Date().toLocaleTimeString();
}

// QR
new QRious({
  element: document.getElementById("wallet-qr"),
  value: `solana:${walletAddress}`,
  size: 200,
  background: "white",
  foreground: "#8000ff"
});

// Init
setupRadioButtons();
setupCopyButton();
setupDonationButtons();
updateTracker();
setInterval(updateTracker, 30000);
