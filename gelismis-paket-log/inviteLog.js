const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const logger = require('../utils/logger');
const { getConfigValue } = require('../configService');

module.exports = (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');
  client.on('inviteCreate', async (invite) => {
    try {
      logger.debug('🔧 inviteCreate eventi tetiklendi.');

      const logChannel = invite.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await invite.guild.fetchAuditLogs({ type: AuditLogEvent.InviteCreate, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          logger.debug(`✅ Davet oluşturan yetkili: ${executor}`);
        } else {
          logger.info('ℹ️ Daveti oluşturan kişi bulunamadı.');
        }
      } catch (err) {
        logger.warn('⚠️ Denetim kayıtları alınamadı (inviteCreate):', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('🔗 Davet Oluşturuldu')
        .setColor('#32CD32')
        .addFields(
          { name: 'Davet Kodu', value: invite.code, inline: true },
          { name: 'Kanal', value: `<#${invite.channel.id}>`, inline: true },
          { name: 'Oluşturan', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log('✅ Davet oluşturma logu başarıyla gönderildi.');
    } catch (err) {
      logger.error('❌ inviteCreate log hatası:', err);
    }
  });

  client.on('inviteDelete', async (invite) => {
    try {
      logger.debug('🔧 inviteDelete eventi tetiklendi.');

      const logChannel = invite.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await invite.guild.fetchAuditLogs({ type: AuditLogEvent.InviteDelete, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          logger.debug(`✅ Davet silen yetkili: ${executor}`);
        } else {
          logger.info('ℹ️ Daveti silen kişi bulunamadı.');
        }
      } catch (err) {
        logger.warn('⚠️ Denetim kayıtları alınamadı (inviteDelete):', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('❌ Davet Silindi')
        .setColor('#FF4500')
        .addFields(
          { name: 'Davet Kodu', value: invite.code, inline: true },
          { name: 'Kanal', value: `<#${invite.channel?.id || 'Bilinmiyor'}>`, inline: true },
          { name: 'Yetkili', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log('✅ Davet silme logu başarıyla gönderildi.');
    } catch (err) {
      logger.error('❌ inviteDelete log hatası:', err);
    }
  });
};
