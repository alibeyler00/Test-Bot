const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('guildBanAdd', async (ban) => {
    const logChannel = ban.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';
    let reason = ban.reason || 'Sebep belirtilmemiş';

    try {
      const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
      const entry = audit.entries.find(e => e.target.id === ban.user.id);
      if (entry) {
        executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
        reason = entry.reason || reason;
      }
    } catch {}

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

    logChannel.send({ embeds: [embed] });
  });

  client.on('guildBanRemove', async (ban) => {
    const logChannel = ban.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';

    try {
      const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
      const entry = audit.entries.find(e => e.target.id === ban.user.id);
      if (entry) executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
    } catch {}

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

    logChannel.send({ embeds: [embed] });
  });
};
