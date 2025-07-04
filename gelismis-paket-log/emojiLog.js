const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');

  client.on('emojiCreate', async (emoji) => {
    try {
      const logChannel = emoji.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiCreate, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
        }
      } catch (err) {
        console.warn('⚠️ Emoji oluşturma denetim kayıtları alınamadı:', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('😊 Emoji Oluşturuldu')
        .setColor('#32CD32')
        .setThumbnail(emoji.url)
        .addFields(
          { name: 'Emoji', value: `${emoji.name} (\`${emoji.id}\`)` },
          { name: 'ID', value: emoji.id },
          { name: 'Yetkili', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Emoji oluşturma logu gönderildi.');
    } catch (err) {
      console.error('❌ emojiCreate log hatası:', err);
    }
  });

  client.on('emojiDelete', async (emoji) => {
    try {
      const logChannel = emoji.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
        }
      } catch (err) {
        console.warn('⚠️ Emoji silme denetim kayıtları alınamadı:', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Emoji Silindi')
        .setColor('#FF4500')
        .addFields(
          { name: 'Emoji', value: `${emoji.name} (\`${emoji.id}\`)` },
          { name: 'ID', value: emoji.id },
          { name: 'Yetkili', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Emoji silme logu gönderildi.');
    } catch (err) {
      console.error('❌ emojiDelete log hatası:', err);
    }
  });

  client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
    try {
      const logChannel = newEmoji.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await newEmoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiUpdate, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
        }
      } catch (err) {
        console.warn('⚠️ Emoji güncelleme denetim kayıtları alınamadı:', err.message);
      }

      const changes = [];
      if (oldEmoji.name !== newEmoji.name)
        changes.push(`**İsim:** \`${oldEmoji.name}\` → \`${newEmoji.name}\``);

      if (oldEmoji.animated !== newEmoji.animated)
        changes.push(`**Animasyon:** \`${oldEmoji.animated ? 'Evet' : 'Hayır'}\` → \`${newEmoji.animated ? 'Evet' : 'Hayır'}\``);

      if (changes.length === 0) {
        console.log('ℹ️ Emoji üzerinde anlamlı bir değişiklik yok, log gönderilmeyecek.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('✏️ Emoji Güncellendi')
        .setColor('#FFA500')
        .addFields(
          { name: 'Emoji', value: `${newEmoji.name} (\`${newEmoji.id}\`)` },
          { name: 'Değişiklikler', value: changes.join('\n') },
          { name: 'Yetkili', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Emoji güncelleme logu gönderildi.');
    } catch (err) {
      console.error('❌ emojiUpdate log hatası:', err);
    }
  });
};
