require('dotenv').config(); // Für OpenAI API Key aus .env

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

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

