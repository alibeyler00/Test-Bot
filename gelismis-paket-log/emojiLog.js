const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const logger = require('../utils/logger');

module.exports = (client) => {
  client.on('emojiCreate', async (emoji) => {
    try {
      logger.debug('🔧 emojiCreate eventi tetiklendi.');

      const logChannel = emoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiCreate, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          logger.debug(`✅ Emoji oluşturan yetkili: ${executor}`);
        } else {
          logger.info('ℹ️ Emoji oluşturan kişi bulunamadı.');
        }
      } catch (err) {
        logger.warn('⚠️ Emoji oluşturma denetim kayıtları alınamadı:', err.message);
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
      logger.log('✅ Emoji oluşturma logu gönderildi.');
    } catch (err) {
      logger.error('❌ emojiCreate log hatası:', err);
    }
  });

  client.on('emojiDelete', async (emoji) => {
    try {
      logger.debug('🔧 emojiDelete eventi tetiklendi.');

      const logChannel = emoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          logger.debug(`✅ Emoji silen yetkili: ${executor}`);
        } else {
          logger.info('ℹ️ Emoji silen kişi bulunamadı.');
        }
      } catch (err) {
        logger.warn('⚠️ Emoji silme denetim kayıtları alınamadı:', err.message);
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
      logger.log('✅ Emoji silme logu gönderildi.');
    } catch (err) {
      logger.error('❌ emojiDelete log hatası:', err);
    }
  });

  client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
    try {
      logger.debug('🔧 emojiUpdate eventi tetiklendi.');

      const logChannel = newEmoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await newEmoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiUpdate, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          logger.debug(`✅ Emoji güncelleyen yetkili: ${executor}`);
        } else {
          logger.info('ℹ️ Emoji güncelleyen kişi bulunamadı.');
        }
      } catch (err) {
        logger.warn('⚠️ Emoji güncelleme denetim kayıtları alınamadı:', err.message);
      }

      const changes = [];
      if (oldEmoji.name !== newEmoji.name)
        changes.push(`**İsim:** \`${oldEmoji.name}\` → \`${newEmoji.name}\``);

      if (oldEmoji.animated !== newEmoji.animated)
        changes.push(`**Animasyon:** \`${oldEmoji.animated ? 'Evet' : 'Hayır'}\` → \`${newEmoji.animated ? 'Evet' : 'Hayır'}\``);

      if (changes.length === 0) {
        logger.info('ℹ️ Emoji üzerinde anlamlı bir değişiklik yok, log gönderilmeyecek.');
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
      logger.log('✅ Emoji güncelleme logu gönderildi.');
    } catch (err) {
      logger.error('❌ emojiUpdate log hatası:', err);
    }
  });
};
