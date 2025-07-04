const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require('discord.js');
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

  client.commands = new Collection();
  client._loadedEvents = [];

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

  function registerCommandsFrom(folder) {
    if (!fs.existsSync(folder)) return;
    const commandFiles = fs.readdirSync(folder).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(folder, file));
      if (command.data && typeof command.execute === 'function') {
        client.commands.set(command.data.name, command);
        console.log(`[✅] Komut yüklendi: ${command.data.name}`);
      } else {
        console.warn(`[UYARI] Geçersiz komut yapısı: ${file}`);
      }
    }
  }

  registerCommandsFrom(path.join(__dirname, 'commands'));
  registerEventsFrom(path.join(__dirname, 'gelismis-paket-log'));
  registerEventsFrom(path.join(__dirname, 'events'));

  client.once('ready', async () => {
    console.log(`${client.user.tag} aktif!`);

    // Slash komutlarını global olarak Discord'a kaydet
    const clientId = client.user.id;
    const rest = new REST({ version: '10' }).setToken(token);

    const commandsJson = [];
    client.commands.forEach(cmd => commandsJson.push(cmd.data.toJSON()));

    try {
      console.log('🔄 Slash komutları global olarak kaydediliyor...');
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandsJson }
      );
      console.log('✅ Slash komutları global olarak başarıyla kaydedildi.');
    } catch (error) {
      console.error('Slash komut kayıt hatası:', error);
    }
  });

  await client.login(token);
})();
