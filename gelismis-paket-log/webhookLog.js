// Kullanıma kapalı

const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('webhookUpdate', async (channel) => {
    const logChannel = channel.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let auditEntry;
    try {
      const auditLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.WebhookCreate, limit: 1 });
      auditEntry = auditLogs.entries.first();
    } catch {}

    const embedCreate = new EmbedBuilder()
      .setTitle('🌐 Webhook Güncellendi')
      .setColor('#00CED1')
      .setDescription(`Webhooklar güncellendi: <#${channel.id}>`)
      .setTimestamp();

    if (auditEntry) {
      embedCreate.addFields(
        { name: 'Yetkili', value: `${auditEntry.executor.tag} (\`${auditEntry.executor.id}\`)` },
        { name: 'Webhook', value: auditEntry.target.name }
      );
    }

    logChannel.send({ embeds: [embedCreate] });
  });
};
