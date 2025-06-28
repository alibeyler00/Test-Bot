const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const logger = require('../utils/logger');

module.exports = (client) => {
  client.on('guildBanAdd', async (ban) => {
    try {
      logger.debug('🔧 guildBanAdd eventi tetiklendi.');

      const logChannel = ban.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';
      let reason = ban.reason || 'Sebep belirtilmemiş';

      try {
        logger.debug('🔍 Ban ekleme için denetim kayıtları çekiliyor...');
        const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
        const entry = audit.entries.find(e => e.target.id === ban.user.id);
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          reason = entry.reason || reason;
          logger.debug(`✅ Yetkili bulundu: ${executor}, Sebep: ${reason}`);
        } else {
          logger.info('ℹ️ Ban yetkilisi bulunamadı.');
        }
      } catch (err) {
        logger.warn('⚠️ Ban denetim kayıtları alınamadı:', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('🚫 Kullanıcı Yasaklandı')
        .setColor('#8B0000')
        .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
        .setThumbnail(ban.user.displayAvatarURL())
        .addFields(
          { name: 'Kullanıcı', value: `${ban.user} (\`${ban.user.id}\`)`, inline: true },
          { name: 'Yetkili', value: executor, inline: true },
          { name: 'Sebep', value: reason }
        )
        .setFooter({ text: `Sunucu: ${ban.guild.name} | Ban ID: ${ban.user.id}` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log('✅ Ban ekleme logu başarıyla gönderildi.');
    } catch (err) {
      logger.error('❌ guildBanAdd log hatası:', err);
    }
  });

  client.on('guildBanRemove', async (ban) => {
    try {
      logger.debug('🔧 guildBanRemove eventi tetiklendi.');

      const logChannel = ban.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        logger.debug('🔍 Ban kaldırma için denetim kayıtları çekiliyor...');
        const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
        const entry = audit.entries.find(e => e.target.id === ban.user.id);
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          logger.debug(`✅ Ban kaldırma yetkilisi bulundu: ${executor}`);
        } else {
          logger.info('ℹ️ Ban kaldırma yetkilisi bulunamadı.');
        }
      } catch (err) {
        logger.warn('⚠️ Ban kaldırma denetim kayıtları alınamadı:', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('✅ Ban Kaldırıldı')
        .setColor('#00AA00')
        .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
        .addFields(
          { name: 'Kullanıcı', value: `${ban.user} (\`${ban.user.id}\`)`, inline: true },
          { name: 'Yetkili', value: executor, inline: true }
        )
        .setFooter({ text: `Sunucu: ${ban.guild.name}` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log('✅ Ban kaldırma logu başarıyla gönderildi.');
    } catch (err) {
      logger.error('❌ guildBanRemove log hatası:', err);
    }
  });
};
