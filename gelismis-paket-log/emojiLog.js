const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('emojiCreate', async (emoji) => {
    const logChannel = emoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';
    try {
      const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiCreate, limit: 1 });
      const entry = audit.entries.first();
      if (entry) executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
    } catch {}

    const embed = new EmbedBuilder()
      .setTitle('😊 Emoji Oluşturuldu')
      .setColor('#32CD32')
      .setThumbnail(emoji.url)
      .addFields(
        { name: 'Emoji', value: `${emoji.name} (${emoji.id})` },
        { name: 'ID', value: emoji.id },
        { name: 'Yetkili', value: executor }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('emojiDelete', async (emoji) => {
    const logChannel = emoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';
    try {
      const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete, limit: 1 });
      const entry = audit.entries.first();
      if (entry) executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
    } catch {}

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Emoji Silindi')
      .setColor('#FF4500')
      .addFields(
        { name: 'Emoji', value: `${emoji.name} (${emoji.id})` },
        { name: 'ID', value: emoji.id },
        { name: 'Yetkili', value: executor }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
    const logChannel = newEmoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';
    try {
      const audit = await newEmoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiUpdate, limit: 1 });
      const entry = audit.entries.first();
      if (entry) executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
    } catch {}

    const changes = [];
    if (oldEmoji.name !== newEmoji.name) changes.push(`**İsim:** \`${oldEmoji.name}\` → \`${newEmoji.name}\``);
    if (oldEmoji.animated !== newEmoji.animated) changes.push(`**Animasyon:** \`${oldEmoji.animated ? 'Evet' : 'Hayır'}\` → \`${newEmoji.animated ? 'Evet' : 'Hayır'}\``);

    if (changes.length === 0) return;

    const embed = new EmbedBuilder()
      .setTitle('✏️ Emoji Güncellendi')
      .setColor('#FFA500')
      .addFields(
        { name: 'Emoji', value: `${newEmoji.name} (${newEmoji.id})` },
        { name: 'Değişiklikler', value: changes.join('\n') },
        { name: 'Yetkili', value: executor }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
