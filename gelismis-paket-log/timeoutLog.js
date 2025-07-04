const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  console.log('⏳ Timeout log sistemi başlatılıyor...');
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');
  console.log(`🔑 Log kanalı ID alındı: ${logChannelId}`);

  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      console.log('🔧 guildMemberUpdate (timeout kontrolü) tetiklendi.');

      const logChannel = newMember.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
      const newTimeout = newMember.communicationDisabledUntilTimestamp;

      if (oldTimeout === newTimeout) {
        console.info('ℹ️ Timeout verisi değişmedi, işlem yapılmıyor.');
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
          console.info(`✅ Timeout işlemi yapan kişi: ${executor}`);
        } else {
          console.info('ℹ️ Timeout yapan yetkili denetim kaydında bulunamadı.');
        }
      } catch (err) {
        console.warn('⚠️ Denetim kayıtları alınamadı:', err.message);
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
        console.log('✅ Timeout verildi logu gönderildi.');
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
        console.log('✅ Timeout kaldırıldı logu gönderildi.');
      } else {
        console.info('ℹ️ Timeout durumu anlamlı şekilde değişmedi, log gönderilmiyor.');
      }
    } catch (err) {
      console.error('❌ Timeout log hatası:', err);
    }
  });
};
