const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

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


client.once('ready', () => {
  console.log(`${client.user.tag} aktif!`);
});


const kolayPaketYolu = path.join(__dirname, 'kolay-paket-log');
fs.readdirSync(kolayPaketYolu).forEach((file) => {
  if (file.endsWith('.js')) {
    const modul = require(path.join(kolayPaketYolu, file));
    modul(client);
  }
});

const OrtaPaketYolu = path.join(__dirname, 'orta-paket-log');
fs.readdirSync(OrtaPaketYolu).forEach((file) => {
  if (file.endsWith('.js')) {
    const modul = require(path.join(OrtaPaketYolu, file));
    modul(client);
  }
});

const GelismisPaketYolu = path.join(__dirname, 'gelismis-paket-log');
fs.readdirSync(GelismisPaketYolu).forEach((file) => {
  if (file.endsWith('.js')) {
    const modul = require(path.join(GelismisPaketYolu, file));
    modul(client);
  }
});

const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/api/bot-info', (req, res) => {
  const commands = client.commands ? Array.from(client.commands.keys()) : [];
  const events = client.eventNames ? client.eventNames() : [];

  res.json({ commands, events });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Uptime sistemi aktif. Port: ${PORT}`));

client.login(process.env['TOKEN']);
