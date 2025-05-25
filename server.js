const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());

// WebSocket-Handling
let sockets = [];
wss.on('connection', (ws) => {
  console.log('✅ WebSocket verbunden');
  sockets.push(ws);

  ws.on('close', () => {
    console.log('❌ WebSocket getrennt');
    sockets = sockets.filter(s => s !== ws);
  });
});

// Webhook (optional)
app.post('/webhook', (req, res) => {
  console.log('📨 Webhook empfangen:', req.body);
  sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(req.body));
    }
  });
  res.sendStatus(200);
});

// Öffentliche Dateien
app.use(express.static(path.join(__dirname, 'public')));

// Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft unter http://localhost:${PORT}`);
});
