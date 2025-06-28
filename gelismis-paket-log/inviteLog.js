const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('inviteCreate', async (invite) => {
    try {
      console.debug('🔧 [DEBUG] inviteCreate eventi tetiklendi.');

      const logChannel = invite.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await invite.guild.fetchAuditLogs({ type: AuditLogEvent.InviteCreate, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.debug(`✅ [INFO] Davet oluşturan yetkili: ${executor}`);
        } else {
          console.debug('ℹ️ [INFO] Daveti oluşturan kişi bulunamadı.');
        }
      } catch (err) {
        console.warn('⚠️ [WARN] Denetim kayıtları alınamadı (inviteCreate):', err.message);
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
      console.log('✅ [LOG] Davet oluşturma logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] inviteCreate log hatası:', err);
    }
  });

  client.on('inviteDelete', async (invite) => {
    try {
      console.debug('🔧 [DEBUG] inviteDelete eventi tetiklendi.');

      const logChannel = invite.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await invite.guild.fetchAuditLogs({ type: AuditLogEvent.InviteDelete, limit: 1 });
        const entry = audit.entries.first();
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.debug(`✅ [INFO] Davet silen yetkili: ${executor}`);
        } else {
          console.debug('ℹ️ [INFO] Daveti silen kişi bulunamadı.');
        }
      } catch (err) {
        console.warn('⚠️ [WARN] Denetim kayıtları alınamadı (inviteDelete):', err.message);
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
      console.log('✅ [LOG] Davet silme logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] inviteDelete log hatası:', err);
    }
  });
};
