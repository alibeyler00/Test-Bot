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
app.get('/', (req, res) => res.send('Bot Aktif!'));
app.listen(3000, () => console.log('Uptime sistemi aktif.'));

client.login(process.env['TOKEN']);
