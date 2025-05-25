const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');

// Wenn node-fetch nicht global installiert ist:
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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

// 📡 Webhook (falls benötigt)
app.post('/webhook', (req, res) => {
  console.log('Webhook erhalten:', req.body);
  sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(req.body));
    }
  });
  res.sendStatus(200);
});

// 📦 Öffentliche Dateien (HTML, JS, CSS, Bilder...)
app.use(express.static(path.join(__dirname, 'public')));

// 🌍 CORS-Proxy für Radio-Streams
app.get('/proxy/*', (req, res) => {
  const targetUrl = decodeURIComponent(req.path.replace('/proxy/', ''));
  console.log('Proxying:', targetUrl);

  fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    .then(response => {
      if (!response.ok) throw new Error('Stream Error');
      res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
      response.body.pipe(res);
    })
    .catch(err => {
      console.error('Proxy Error:', err.message);
      res.status(500).send('Stream Error');
    });
});

// 🚀 Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
