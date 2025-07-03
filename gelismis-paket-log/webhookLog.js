const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const logger = require('../utils/logger'); 
const { getConfigValue } = require('../configService');

module.exports = (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');
  client.on('webhookUpdate', async (channel) => {
    try {
      const logChannel = channel.guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      const auditTypes = [
        AuditLogEvent.WebhookCreate,
        AuditLogEvent.WebhookUpdate,
        AuditLogEvent.WebhookDelete
      ];

      let auditEntry;
      for (const type of auditTypes) {
        try {
          const auditLogs = await channel.guild.fetchAuditLogs({ type, limit: 1 });
          const entry = auditLogs.entries.first();
          if (entry && entry.createdTimestamp > (Date.now() - 10000)) {
            auditEntry = entry;
            break;
          }
        } catch (err) {
          logger.warn(`⚠️ Denetim kayıtları alınamadı (type: ${type}): ${err.message}`);
        }
      }

      let title = '🌐 Webhook Güncellendi';
      let color = '#00CED1';
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
      logger.info(`✅ Webhook logu gönderildi: ${title}`);
    } catch (error) {
      logger.error('❌ [HATA] webhookUpdate log hatası:', error);
    }
  });
};
