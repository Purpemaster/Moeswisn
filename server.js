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

// 🌈 Bildgenerierung für Purpe Machine
app.get('/generate-image', async (req, res) => {
  try {
    const prompt = `A digitally illustrated Purple Pepe frog in various wild styles and accessories, trending meme aesthetics, vivid colors, high detail, no text`;

    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024'
      })
    });

    const json = await openaiRes.json();
    const image = json.data?.[0]?.url;

    if (image) {
      res.json({ image });
    } else {
      res.status(500).json({ error: 'No image received' });
    }
  } catch (err) {
    console.error('Fehler bei der Bildgenerierung:', err);
    res.status(500).json({ error: 'Bildgenerierung fehlgeschlagen' });
  }
});

// 🗂 Statische Dateien (z. B. public/index.html, .css, .js, icons etc.)
app.use(express.static(path.join(__dirname, 'public')));

// 🚀 Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
