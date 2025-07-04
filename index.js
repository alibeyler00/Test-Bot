const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { getConfigValue } = require('./configService');
const fs = require('fs');
const path = require('path');

(async () => {
  const token = await getConfigValue("TOKEN");
  console.log("🚨 Bot Tokenı:", token);

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

  registerEventsFrom(path.join(__dirname, 'gelismis-paket-log'));

  await client.login(token);
})();
