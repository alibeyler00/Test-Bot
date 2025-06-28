const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      console.debug('🔧 [DEBUG] guildMemberUpdate (timeout kontrolü) tetiklendi.');

      const logChannel = newMember.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
      const newTimeout = newMember.communicationDisabledUntilTimestamp;

      if (oldTimeout === newTimeout) {
        console.debug('ℹ️ [INFO] Timeout verisi değişmedi, işlem yapılmıyor.');
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
          console.debug(`✅ [INFO] Timeout işlemi yapan kişi: ${executor}`);
        }
      } catch (err) {
        console.warn('⚠️ [WARN] Denetim kayıtları alınamadı:', err.message);
      }

      // Timeout verildi
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
        console.log('✅ [LOG] Timeout verildi logu gönderildi.');
      }
      // Timeout kaldırıldı
      else if (!newTimeout && oldTimeout) {
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
        console.log('✅ [LOG] Timeout kaldırıldı logu gönderildi.');
      }
    } catch (err) {
      console.error('❌ [HATA] Timeout log hatası:', err);
    }
  });
};
