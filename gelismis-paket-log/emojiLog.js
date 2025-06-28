const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('emojiCreate', async (emoji) => {
    try {
      console.debug('🔧 [DEBUG] emojiCreate eventi tetiklendi.');

      const logChannel = emoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiCreate, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.debug(`✅ [INFO] Emoji oluşturan yetkili: ${executor}`);
        } else {
          console.debug('ℹ️ [INFO] Emoji oluşturan kişi bulunamadı.');
        }
      } catch (err) {
        console.warn('⚠️ [WARN] Emoji oluşturma denetim kayıtları alınamadı:', err.message);
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
      console.log('✅ [LOG] Emoji oluşturma logu gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] emojiCreate log hatası:', err);
    }
  });

  client.on('emojiDelete', async (emoji) => {
    try {
      console.debug('🔧 [DEBUG] emojiDelete eventi tetiklendi.');

      const logChannel = emoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.debug(`✅ [INFO] Emoji silen yetkili: ${executor}`);
        } else {
          console.debug('ℹ️ [INFO] Emoji silen kişi bulunamadı.');
        }
      } catch (err) {
        console.warn('⚠️ [WARN] Emoji silme denetim kayıtları alınamadı:', err.message);
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
      console.log('✅ [LOG] Emoji silme logu gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] emojiDelete log hatası:', err);
    }
  });

  client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
    try {
      console.debug('🔧 [DEBUG] emojiUpdate eventi tetiklendi.');

      const logChannel = newEmoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await newEmoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiUpdate, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.debug(`✅ [INFO] Emoji güncelleyen yetkili: ${executor}`);
        } else {
          console.debug('ℹ️ [INFO] Emoji güncelleyen kişi bulunamadı.');
        }
      } catch (err) {
        console.warn('⚠️ [WARN] Emoji güncelleme denetim kayıtları alınamadı:', err.message);
      }

      const changes = [];
      if (oldEmoji.name !== newEmoji.name)
        changes.push(`**İsim:** \`${oldEmoji.name}\` → \`${newEmoji.name}\``);

      if (oldEmoji.animated !== newEmoji.animated)
        changes.push(`**Animasyon:** \`${oldEmoji.animated ? 'Evet' : 'Hayır'}\` → \`${newEmoji.animated ? 'Evet' : 'Hayır'}\``);

      if (changes.length === 0) {
        console.debug('ℹ️ [INFO] Emoji üzerinde anlamlı bir değişiklik yok, log gönderilmeyecek.');
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
      console.log('✅ [LOG] Emoji güncelleme logu gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] emojiUpdate log hatası:', err);
    }
  });
};
