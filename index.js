const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
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

// --- Yeni: express-session ve passport setup ---
app.use(session({
  secret: process.env.SESSION_SECRET || 's3CuR3$eCreT_2025!', 
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialize/deserialize
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Discord OAuth2 stratejisi
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL || 'https://874c3142-9dd4-4537-8cfc-36f16d507ec5-00-275ksdccqqimr.sisko.replit.dev/auth/discord/callback',
  scope: ['identify', 'guilds'],
}, (accessToken, refreshToken, profile, done) => {
  // Kullanıcı bilgisi profile içinde
  return done(null, profile);
}));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// --- OAuth Routes ---
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');  // Başarılı giriş sonrası yönlendirilecek adres
  }
);

// Çıkış
app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Giriş yapılmış kullanıcı bilgisi endpoint'i
app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Giriş yapılmamış!' });
  res.json(req.user);
});

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Bot info API (aynı sende olan)
app.get('/api/bot-info', (req, res) => {
  const commands = []; // Eğer varsa komutları doldur
  const events = client._loadedEvents || [];

  // Sunucu bilgisi ekle
  const servers = client.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    memberCount: guild.memberCount,
    iconURL: guild.iconURL({ dynamic: true, size: 128 }) || null,
  }));

  console.log(">> API İSTEĞİ /api/bot-info");
  console.log(">> Yüklü Eventler:", events);
  console.log(">> Sunucular:", servers);

  res.json({ commands, events, servers });
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
