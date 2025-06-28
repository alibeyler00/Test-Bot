const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const logChannel = newMember.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
    const newTimeout = newMember.communicationDisabledUntilTimestamp;

    if (oldTimeout === newTimeout) return;

    let executor = 'Bilinmiyor';
    try {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 5 });
      const entry = auditLogs.entries.find(e => e.target.id === newMember.id && e.changes.some(c => c.key === 'communication_disabled_until'));
      if (entry) executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
    } catch {}

    if (newTimeout && (!oldTimeout || newTimeout > oldTimeout)) {
      const embed = new EmbedBuilder()
        .setTitle('⏱️ Kullanıcı Timeoutlandı')
        .setColor('#FF4500')
        .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
        .addFields(
          { name: 'Kullanıcı', value: `${newMember.user} (\`${newMember.user.id}\`)`, inline: true },
          { name: 'Yetkili', value: executor, inline: true },
          { name: 'Bitiş Zamanı', value: `<t:${Math.floor(newTimeout / 1000)}:F>` }
        )
        .setTimestamp()
        .setFooter({ text: `Sunucu: ${newMember.guild.name}` });

      logChannel.send({ embeds: [embed] });
    } else if (!newTimeout) {
      const embed = new EmbedBuilder()
        .setTitle('⏳ Timeout Kaldırıldı')
        .setColor('#00FF00')
        .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
        .addFields(
          { name: 'Kullanıcı', value: `${newMember.user} (\`${newMember.user.id}\`)`, inline: true },
          { name: 'Yetkili', value: executor, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Sunucu: ${newMember.guild.name}` });

      logChannel.send({ embeds: [embed] });
    }
  });
};
