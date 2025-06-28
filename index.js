const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { broadcastLog, clients } = require('./websocket');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client._loadedEvents = [];

client.once('ready', () => {
  console.log(`${client.user.tag} aktif!`);
});

function registerEventsFrom(folder) {
  if (!fs.existsSync(folder)) {
    console.warn(`[UYARI] ${folder} klasörü bulunamadı!`);
    return;
  }

  const files = fs.readdirSync(folder);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const eventPath = path.join(folder, file);
      const eventModule = require(eventPath);
      if (typeof eventModule === 'function') {
        eventModule(client);
        const eventName = file.replace('.js', '');
        client._loadedEvents.push(eventName);
        console.log(`[✅] Event yüklendi: ${eventName}`);
      } else {
        console.warn(`[UYARI] ${file} fonksiyon olarak export edilmemiş!`);
      }
    }
  }
}


registerEventsFrom(path.join(__dirname, 'kolay-paket-log'));
registerEventsFrom(path.join(__dirname, 'orta-paket-log'));
registerEventsFrom(path.join(__dirname, 'gelismis-paket-log'));

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/bot-info', (req, res) => {
  const commands = [];
  const events = client._loadedEvents || [];

  console.log(">> API İSTEĞİ /api/bot-info");
  console.log(">> Yüklü Eventler:", events);

  res.json({ commands, events });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws/logs') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Sunucu aktif. Port: ${PORT}`));

client.login(process.env['TOKEN']);
