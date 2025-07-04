const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');

  client.on('inviteCreate', async (invite) => {
    try {
      const logChannel = invite.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await invite.guild.fetchAuditLogs({ type: AuditLogEvent.InviteCreate, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
        }
      } catch (err) {
        console.warn('⚠️ Denetim kayıtları alınamadı (inviteCreate):', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('🔗 Davet Oluşturuldu')
        .setColor('#32CD32')
        .addFields(
          { name: 'Davet Kodu', value: invite.code, inline: true },
          { name: 'Kanal', value: `<#${invite.channel.id}>`, inline: true },
          { name: 'Oluşturan', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Davet oluşturma logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ inviteCreate log hatası:', err);
    }
  });

  client.on('inviteDelete', async (invite) => {
    try {
      const logChannel = invite.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await invite.guild.fetchAuditLogs({ type: AuditLogEvent.InviteDelete, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
        }
      } catch (err) {
        console.warn('⚠️ Denetim kayıtları alınamadı (inviteDelete):', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('❌ Davet Silindi')
        .setColor('#FF4500')
        .addFields(
          { name: 'Davet Kodu', value: invite.code, inline: true },
          { name: 'Kanal', value: `<#${invite.channel?.id || 'Bilinmiyor'}>`, inline: true },
          { name: 'Yetkili', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Davet silme logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ inviteDelete log hatası:', err);
    }
  });
};
