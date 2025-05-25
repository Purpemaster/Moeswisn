const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 🧠 WebSocket-Verbindungen
let sockets = [];
wss.on('connection', (ws) => {
  console.log('✅ WebSocket verbunden');
  sockets.push(ws);

  ws.on('close', () => {
    console.log('❌ WebSocket getrennt');
    sockets = sockets.filter(s => s !== ws);
  });
});

// 📡 Webhook (optional)
app.use(bodyParser.json());
app.post('/webhook', (req, res) => {
  console.log('📨 Webhook empfangen:', req.body);
  sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(req.body));
    }
  });
  res.sendStatus(200);
});

// 🗂 Statische Dateien bereitstellen (HTML, CSS, JS, Icons, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// 🚀 Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
