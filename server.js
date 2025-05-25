const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request'); // <- für Proxy

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let sockets = [];
wss.on('connection', (ws) => {
  console.log('WebSocket verbunden');
  sockets.push(ws);

  ws.on('close', () => {
    console.log('WebSocket getrennt');
    sockets = sockets.filter(s => s !== ws);
  });
});

app.use(bodyParser.json());

// 🔁 Webhook-Verarbeitung
app.post('/webhook', (req, res) => {
  console.log('Webhook erhalten:', req.body);
  sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(req.body));
    }
  });
  res.sendStatus(200);
});

// 🌐 Statische Dateien
app.use(express.static(path.join(__dirname, 'public')));

// 🔁 Radio-CORS-Proxy
app.get('/proxy/*', (req, res) => {
  const streamUrl = decodeURIComponent(req.params[0]);

  if (!streamUrl.startsWith('http')) {
    return res.status(400).send('Ungültige Stream-URL');
  }

  console.log(`Proxy-Weiterleitung: ${streamUrl}`);
  req.pipe(request(streamUrl)).pipe(res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
