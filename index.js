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

app.use(express.json()); // JSON gövde parse için

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
app.get('/api/user', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Giriş yapılmamış!' });

  const user = req.user;
  const guild = client.guilds.cache.get('1017854108662767659');
  if (!guild) return res.status(500).json({ error: 'Sunucu bulunamadı' });

  try {
    const member = await guild.members.fetch({ user: user.id, force: true });

    const roles = member.roles.cache.map(role => role.id);
    
    res.json({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      roles,
    });
    console.log('[🧪] Çekilen kullanıcı:', member.user.tag);
    console.log('[🧪] Rol ID\'leri:', roles);

    console.log('[✅] Kullanıcı Rolleri:', roles);

  } catch (err) {
    console.error('[❌] Kullanıcı rol bilgisi alınamadı:', err);
    res.status(500).json({ error: 'Kullanıcı bilgisi alınamadı' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Giriş yapılmamış!' });

  const guild = client.guilds.cache.get('1017854108662767659');
  if (!guild) return res.status(500).json({ error: 'Sunucu bulunamadı!' });

  try {
    const member = await guild.members.fetch(req.user.id);
    const roles = member.roles.cache.map(role => role.id);
    if (!roles.includes('1071958335122837554')) {
      return res.status(403).json({ error: 'Yetkiniz yok!' });
    }

    await guild.members.fetch();
    console.log('Cachedeki üye sayısı: ${guild.members.cache.size}');

    const members = guild.members.cache;
    const userList = members.map(member => ({
      id: member.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      avatar: member.user.avatar,
    }));

    res.json(userList);
  } catch (err) {
    console.error('Kullanıcılar alınamadı:', err);
    res.status(500).json({ error: 'Sunucu üyeleri alınamadı.' });
  }
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
  
  const uptimeMs = client.uptime || 0;
  const uptimeMinutes = Math.floor(uptimeMs / 60000);
  const ping = Math.floor(client.ws.ping);
  
  res.json({ commands, events, servers, uptime: uptimeMinutes, ping });
});



// Kick işlemi
app.post('/api/user/kick', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Giriş yapılmamış!' });

  const { targetUserId, reason } = req.body;
  if (!targetUserId) return res.status(400).json({ error: 'Hedef kullanıcı belirtilmedi!' });

  const guild = client.guilds.cache.get('1017854108662767659');
  if (!guild) return res.status(500).json({ error: 'Sunucu bulunamadı!' });

  try {
    const member = await guild.members.fetch(req.user.id);
    const roles = member.roles.cache.map(r => r.id);
    if (!roles.includes('1071958335122837554')) return res.status(403).json({ error: 'Yetkiniz yok!' });

    const targetMember = await guild.members.fetch(targetUserId);
    await targetMember.kick(reason || 'Sebep belirtilmedi');
    res.json({ message: 'Kullanıcı sunucudan atıldı.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
});

// Ban işlemi
app.post('/api/user/ban', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Giriş yapılmamış!' });

  const { targetUserId, reason } = req.body;
  if (!targetUserId) return res.status(400).json({ error: 'Hedef kullanıcı belirtilmedi!' });

  const guild = client.guilds.cache.get('1017854108662767659');
  if (!guild) return res.status(500).json({ error: 'Sunucu bulunamadı!' });

  try {
    const member = await guild.members.fetch(req.user.id);
    const roles = member.roles.cache.map(r => r.id);
    if (!roles.includes('1071958335122837554')) return res.status(403).json({ error: 'Yetkiniz yok!' });

    await guild.bans.create(targetUserId, { reason: reason || 'Sebep belirtilmedi' });
    res.json({ message: 'Kullanıcı banlandı.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
});

// Timeout (mute) işlemi - Discord.js v14'te timeout için:
app.post('/api/user/timeout', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Giriş yapılmamış!' });

  const { targetUserId, durationSeconds, reason } = req.body;
  if (!targetUserId || !durationSeconds) return res.status(400).json({ error: 'Eksik parametre!' });

  const guild = client.guilds.cache.get('1017854108662767659');
  if (!guild) return res.status(500).json({ error: 'Sunucu bulunamadı!' });

  try {
    const member = await guild.members.fetch(req.user.id);
    const roles = member.roles.cache.map(r => r.id);
    if (!roles.includes('1071958335122837554')) return res.status(403).json({ error: 'Yetkiniz yok!' });

    const targetMember = await guild.members.fetch(targetUserId);
    await targetMember.timeout(durationSeconds * 1000, reason || 'Sebep belirtilmedi');
    res.json({ message: `Kullanıcı ${durationSeconds} saniye süreyle susturuldu.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
});

app.get('/api/user/guilds', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Giriş yapılmamış!' });

  const userGuilds = req.user.guilds; // DiscordStrategy ile gelen sunucu listesi
  const botGuilds = client.guilds.cache;

  // Ortak olanları filtrele
  const mutualGuilds = userGuilds.filter(guild => botGuilds.has(guild.id));

  const result = mutualGuilds.map(guild => {
    const botGuild = botGuilds.get(guild.id);
    return {
      id: guild.id,
      name: guild.name,
      iconURL: botGuild.iconURL({ dynamic: true }) || null,
      memberCount: botGuild.memberCount,
      permissions: guild.permissions,
    };
  });

  res.json(result);
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
