const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('inviteCreate', async (invite) => {
    const logChannel = invite.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';
    try {
      const audit = await invite.guild.fetchAuditLogs({ type: AuditLogEvent.InviteCreate, limit: 1 });
      const entry = audit.entries.first();
      if (entry) executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
    } catch {}

    const embed = new EmbedBuilder()
      .setTitle('🔗 Davet Oluşturuldu')
      .setColor('#32CD32')
      .addFields(
        { name: 'Davet Kodu', value: invite.code },
        { name: 'Oluşturan', value: executor }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('inviteDelete', async (invite) => {
    const logChannel = invite.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';
    try {
      const audit = await invite.guild.fetchAuditLogs({ type: AuditLogEvent.InviteDelete, limit: 1 });
      const entry = audit.entries.first();
      if (entry) executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
    } catch {}

    const embed = new EmbedBuilder()
      .setTitle('❌ Davet Silindi')
      .setColor('#FF4500')
      .addFields(
        { name: 'Davet Kodu', value: invite.code },
        { name: 'Yetkili', value: executor }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
