const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('webhookUpdate', async (channel) => {
    try {
      const logChannel = channel.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) return;

      // Audit logları webhook ile ilgili farklı türlerde inceleyelim:
      const auditTypes = [
        AuditLogEvent.WebhookCreate,
        AuditLogEvent.WebhookUpdate,
        AuditLogEvent.WebhookDelete
      ];

      // En son webhook ile ilgili herhangi bir işlem
      let auditEntry;
      for (const type of auditTypes) {
        try {
          const auditLogs = await channel.guild.fetchAuditLogs({ type, limit: 1 });
          const entry = auditLogs.entries.first();
          if (entry && entry.createdTimestamp > (Date.now() - 10000)) { // son 10 saniyede
            auditEntry = entry;
            break;
          }
        } catch {}
      }

      let title = '🌐 Webhook Güncellendi';
      let color = '#00CED1'; // default renk
      let description = `Webhooklar güncellendi: <#${channel.id}>`;

      if (auditEntry) {
        switch (auditEntry.action) {
          case AuditLogEvent.WebhookCreate:
            title = '➕ Webhook Oluşturuldu';
            color = '#32CD32';
            description = `Yeni webhook oluşturuldu: **${auditEntry.target.name}** (<#${channel.id}>)`;
            break;
          case AuditLogEvent.WebhookUpdate:
            title = '✏️ Webhook Güncellendi';
            color = '#FFA500';
            description = `Webhook güncellendi: **${auditEntry.target.name}** (<#${channel.id}>)`;
            break;
          case AuditLogEvent.WebhookDelete:
            title = '🗑️ Webhook Silindi';
            color = '#FF4500';
            description = `Webhook silindi: **${auditEntry.target.name}** (<#${channel.id}>)`;
            break;
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setDescription(description)
        .setTimestamp();

      if (auditEntry && auditEntry.executor) {
        embed.addFields(
          { name: 'Yetkili', value: `${auditEntry.executor.tag} (\`${auditEntry.executor.id}\`)` }
        );
      } else {
        embed.addFields(
          { name: 'Yetkili', value: 'Bilinmiyor' }
        );
      }

      await logChannel.send({ embeds: [embed] });
      console.log(`✅ Webhook logu gönderildi: ${title}`);
    } catch (error) {
      console.error('❌ [HATA] webhookUpdate log hatası:', error);
    }
  });
};
