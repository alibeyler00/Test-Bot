  const { Client, GatewayIntentBits, Partials } = require('discord.js');
  const { getConfigValue } = require('./configService');
  const fs = require('fs');
  const path = require('path');
  const express = require('express');
  const http = require('http');
  const WebSocket = require('ws');
  const session = require('express-session');
  const passport = require('passport');
  const DiscordStrategy = require('passport-discord').Strategy;
  const { broadcastLog, clients } = require('./websocket');

  (async () => {
    const token = await getConfigValue("TOKEN");
    const sessionSecret = await getConfigValue("SESSION_SECRET");
    const clientID = await getConfigValue("DISCORD_CLIENT_ID");
    const clientSecret = await getConfigValue("DISCORD_CLIENT_SECRET");
    const callbackURL = await getConfigValue("DISCORD_CALLBACK_URL");
    const logChannelId = await getConfigValue("LOG_CHANNEL_ID");

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

    app.use(session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    passport.use(new DiscordStrategy({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      scope: ['identify', 'guilds'],
    }, (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }));

    // Express routes (devamı aynı şekilde çalışır)

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

    await client.login(token);
  })();
