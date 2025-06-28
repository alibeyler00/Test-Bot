const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = (client) => {
  client.on('guildMemberRemove', async (member) => {
    try {
      logger.debug('🥾 guildMemberRemove eventi tetiklendi.');

      const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let kicked = false;
      let executor = 'Bilinmiyor';
      let reason = 'Belirtilmedi';

      try {
        const audit = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
        const entry = audit.entries.first();

        if (entry) {
          const now = Date.now();
          const diff = now - entry.createdTimestamp;
          logger.debug(`🔍 Denetim kaydı bulundu. Hedef: ${entry.target?.id}, Süre: ${diff}ms`);

          if (entry.target?.id === member.id && diff < 5000) {
            kicked = true;
            executor = entry.executor ? `${entry.executor.tag} (\`${entry.executor.id}\`)` : 'Bilinmiyor';
            reason = entry.reason || reason;
            logger.debug(`✅ Kullanıcı atılmış (kick). Yetkili: ${executor}`);
          } else {
            logger.info('ℹ️ Kullanıcı atılmamış gibi görünüyor.');
          }
        } else {
          logger.info('ℹ️ Kick denetim kaydı bulunamadı.');
        }
      } catch (err) {
        logger.warn('⚠️ Denetim kayıtları alınamadı (kick kontrolü):', err.message);
      }

      if (!kicked) {
        logger.info('ℹ️ Kullanıcı kendi ayrılmış olabilir. Log gönderilmeyecek.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🥾 Kullanıcı Sunucudan Atıldı (Kick)')
        .setColor('#ED4245')
        .addFields(
          { name: 'Kullanıcı', value: `${member.user.tag} (\`${member.id}\`)` },
          { name: 'Yetkili', value: executor },
          { name: 'Sebep', value: reason }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log('✅ Kick logu başarıyla gönderildi.');
    } catch (err) {
      logger.error('❌ guildMemberRemove (kick) log hatası:', err);
    }
  });
};
