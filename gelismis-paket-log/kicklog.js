const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberRemove', async (member) => {
    try {
      console.debug('🥾 [DEBUG] guildMemberRemove eventi tetiklendi.');

      const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
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
          console.debug(`🔍 [DEBUG] Denetim kaydı bulundu. Hedef: ${entry.target?.id}, Süre: ${diff}ms`);

          if (entry.target?.id === member.id && diff < 5000) {
            kicked = true;
            executor = entry.executor ? `${entry.executor.tag} (\`${entry.executor.id}\`)` : 'Bilinmiyor';
            reason = entry.reason || reason;
            console.debug(`✅ [INFO] Kullanıcı atılmış (kick). Yetkili: ${executor}`);
          } else {
            console.debug('ℹ️ [INFO] Kullanıcı atılmamış gibi görünüyor.');
          }
        } else {
          console.debug('ℹ️ [INFO] Kick denetim kaydı bulunamadı.');
        }
      } catch (err) {
        console.warn('⚠️ [WARN] Denetim kayıtları alınamadı (kick kontrolü):', err.message);
      }

      if (!kicked) {
        console.debug('ℹ️ [INFO] Kullanıcı kendi ayrılmış olabilir. Log gönderilmeyecek.');
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
      console.log('✅ [LOG] Kick logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] guildMemberRemove (kick) log hatası:', err);
    }
  });
};
