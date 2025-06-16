const walletAddress = "9uo3TB4a8synap9VMNpby6nzmnMs9xJWmgo2YKJHZWVn";
const heliusApiKey = "9cf905ed-105d-46a7-b7fa-7440388b6e9f";
const goalUSD1 = 20000, goalUSD2 = 100000;

const radioStations = [
  {stream:"https://stream.laut.fm/house",icon:"house_icon.png"},
  {stream:"https://stream.laut.fm/metalradio",icon:"heavy_metal_icon.png"},
  {stream:"https://stream.laut.fm/pop",icon:"pop_music_icon.png"},
  {stream:"https://stream.laut.fm/electropop",icon:"electro_icon.png"},
  {stream:"http://ice.bassdrive.net/stream56",icon:"drum_and_bass_icon.png"},
  {stream:"https://streaming.radio.co/s774887f7b/listen",icon:"jazz_soul_icon.png"},
  {stream:"https://stream.laut.fm/jahfari",icon:"reggae_icon.png"},
  {stream:"https://stream.laut.fm/gothic-radio-saar",icon:"gothic_icon.png"},
  {stream:"https://stream.laut.fm/aufden-punk-t",icon:"skate_punk_icon.png"},
  {stream:"https://stream.laut.fm/volksmusikradio",icon:"folk_music_icon.png"},
  {stream:"http://live.powerhitz.com/hot108?aw_0_req.gdpr=true",icon:"hip_hop_icon.png"},
  {stream:"https://strm112.1.fm/ccountry_mobile_mp3",icon:"country_icon.png"},
];

function toggleQR(){
  const c = document.getElementById("qr-container");
  c.style.display = (c.style.display==="block")?"none":"block";
}
function toggleAddress(){
  const a = document.getElementById("address-container");
  a.style.display = (a.style.display==="flex")?"none":"flex";
}

function setupRadioButtons() {
  const container = document.getElementById("radio-buttons");
  const player = document.getElementById("radio-player");
  radioStations.forEach(s => {
    const img = document.createElement("img");
    img.src = s.icon;
    img.className = "radio-icon";
    img.addEventListener("click", ()=>{
      document.querySelectorAll(".radio-icon").forEach(i=>i.classList.remove("active"));
      img.classList.add("active");
      player.src = s.stream;
      player.play();
    });
    container.appendChild(img);
  });
}

function setupCopyButton() {
  document.getElementById("copy-button").addEventListener("click", ()=>{
    navigator.clipboard.writeText(walletAddress)
      .then(()=> alert("Wallet-Adresse kopiert!"))
      .catch(()=> alert("Fehler beim Kopieren"));
  });
}

function setupDonationButtons(){
  document.getElementById("donate-sol").onclick = ()=>{
    window.location.href = `solana:${walletAddress}?amount=1&label=Purple%20Pepe%20Donation`;
  };
  document.getElementById("donate-purpe").onclick = ()=>{
    window.location.href = `solana:${walletAddress}?amount=3000000&spl-token=HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL&label=Purple%20Pepe%20Donation`;
  };
}

function updateProgress(total){
  const p1 = Math.min((total/goalUSD1)*100,100);
  const p2 = total>goalUSD1 ? Math.min(((total-goalUSD1)/(goalUSD2-goalUSD1))*100,100) : 0;
  document.getElementById("progress-fill-1").style.width = p1+"%";
  document.getElementById("progress-fill-2").style.width = p2+"%";
  document.getElementById("current-amount").textContent = `$${total.toFixed(2)}`;
}

async function fetchJson(url){
  try { const r = await fetch(url); return r.json(); }
  catch { return null; }
}

async function fetchSolPrice(){
  const d = await fetchJson("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
  return d?.solana?.usd||0;
}

async function fetchPurpe(){
  const d = await fetchJson("https://api.geckoterminal.com/api/v2/networks/solana/pools/CpoYFgaNA6MJRuJSGeXu9mPdghmtwd5RvYesgej4Zofj");
  return parseFloat(d?.data?.attributes?.base_token_price_usd)||0;
}

async function fetchBalance(){
  const d = await fetchJson(`https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${heliusApiKey}`);
  const sol = (d?.nativeBalance || 0)/1e9;
  const tok = d?.tokens?.find(t=> t.mint === "HBoNJ5v8g71s2boRivrHnfSB5MVPLDHHyVjruPfhGkvL");
  const purpe = tok ? tok.amount/(10**(tok.decimals||6)) : 0;
  return {sol,purpe};
}

async function updateTracker(){
  const [bal, solP, purP] = await Promise.all([ fetchBalance(), fetchSolPrice(), fetchPurpe() ]);
  const total = bal.sol * solP + bal.purpe * purP;
  updateProgress(total);
  document.getElementById("last-updated").textContent = new Date().toLocaleTimeString();
}

function setupARTrigger(){
  document.getElementById("purpe-ar-trigger").addEventListener("click", e=>{
    // nur iOS Quick Look aktiv durch browser via rel="ar"
    // Android/WebXR handled browser selbst
  });
}

new QRious({element:document.getElementById("wallet-qr"),value:`solana:${walletAddress}`,size:200,background:"white",foreground:"#8000ff"});

setupRadioButtons();
setupCopyButton();
setupDonationButtons();
setupARTrigger();
updateTracker();
setInterval(updateTracker, 30000);
