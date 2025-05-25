const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

// 📦 Falls node-fetch nicht installiert ist:
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 🌐 Globaler CORS-Schutz (optional, aber praktisch)
app.use(cors());

// 🧠 WebSocket-Verbindungen verwalten
let sockets = [];
wss.on('connection', (ws) => {
  console.log('✅ WebSocket verbunden');
  sockets.push(ws);

  ws.on('close', () => {
    console.log('❌ WebSocket getrennt');
    sockets = sockets.filter(s => s !== ws);
  });
});

// 🔐 Body Parser Middleware
app.use(bodyParser.json());

// 📡 Webhook (optional)
app.post('/webhook', (req, res) => {
  console.log('📨 Webhook empfangen:', req.body);
  sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(req.body));
    }
  });
  res.sendStatus(200);
});

// 🗂 Öffentliche Dateien (HTML, JS, CSS, Bilder)
app.use(express.static(path.join(__dirname, 'public')));

// 🌍 CORS-Proxy für Radio-Streams
app.get('/proxy/*', (req, res) => {
  const targetUrl = decodeURIComponent(req.path.replace('/proxy/', ''));
  console.log('🔁 Proxy für:', targetUrl);

  fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    .then(response => {
      if (!response.ok) throw new Error('Stream konnte nicht geladen werden.');

      res.setHeader('Access-Control-Allow-Origin', '*'); // ✅ Wichtig für Audio
      res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');

      response.body.pipe(res);
    })
    .catch(err => {
      console.error('❌ Proxy-Fehler:', err.message);
      res.status(500).send('Fehler beim Streamen.');
    });
});

// 🚀 Starte Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
