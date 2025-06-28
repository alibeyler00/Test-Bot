const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const logger = require('../utils/logger'); 

module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      logger.debug('🔧 [DEBUG] guildMemberUpdate (timeout kontrolü) tetiklendi.');

      const logChannel = newMember.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
      const newTimeout = newMember.communicationDisabledUntilTimestamp;

      if (oldTimeout === newTimeout) {
        logger.info('ℹ️ [INFO] Timeout verisi değişmedi, işlem yapılmıyor.');
        return;
      }

      let executor = 'Bilinmiyor';
      try {
        const auditLogs = await newMember.guild.fetchAuditLogs({
          type: AuditLogEvent.MemberUpdate,
          limit: 5
        });

        const entry = auditLogs.entries.find(e =>
          e.target.id === newMember.id &&
          e.changes.some(c => c.key === 'communication_disabled_until')
        );

        if (entry && entry.executor) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          logger.info(`✅ [INFO] Timeout işlemi yapan kişi: ${executor}`);
        } else {
          logger.info('ℹ️ [INFO] Timeout yapan yetkili denetim kaydında bulunamadı.');
        }
      } catch (err) {
        logger.warn('⚠️ [WARN] Denetim kayıtları alınamadı:', err.message);
      }

      if (newTimeout && (!oldTimeout || newTimeout > oldTimeout)) {
        const embed = new EmbedBuilder()
          .setTitle('⏱️ Kullanıcı Timeoutlandı')
          .setColor('#FF4500')
          .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
          .addFields(
            { name: 'Kullanıcı', value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
            { name: 'Yetkili', value: executor, inline: true },
            { name: 'Bitiş Zamanı', value: `<t:${Math.floor(newTimeout / 1000)}:F>` }
          )
          .setTimestamp()
          .setFooter({ text: `Sunucu: ${newMember.guild.name}` });

        await logChannel.send({ embeds: [embed] });
        logger.info('✅ [LOG] Timeout verildi logu gönderildi.');
      } else if (!newTimeout && oldTimeout) {
        const embed = new EmbedBuilder()
          .setTitle('⏳ Timeout Kaldırıldı')
          .setColor('#00FF00')
          .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
          .addFields(
            { name: 'Kullanıcı', value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
            { name: 'Yetkili', value: executor, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: `Sunucu: ${newMember.guild.name}` });

        await logChannel.send({ embeds: [embed] });
        logger.info('✅ [LOG] Timeout kaldırıldı logu gönderildi.');
      } else {
        logger.info('ℹ️ [INFO] Timeout durumu anlamlı şekilde değişmedi, log gönderilmiyor.');
      }
    } catch (err) {
      logger.error('❌ [HATA] Timeout log hatası:', err);
    }
  });
};
