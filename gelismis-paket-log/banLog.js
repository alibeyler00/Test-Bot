const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('guildBanAdd', async (ban) => {
    try {
      console.debug('🔧 [DEBUG] guildBanAdd eventi tetiklendi.');

      const logChannel = ban.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';
      let reason = ban.reason || 'Sebep belirtilmemiş';

      try {
        console.debug('🔍 [DEBUG] Ban ekleme için denetim kayıtları çekiliyor...');
        const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
        const entry = audit.entries.find(e => e.target.id === ban.user.id);
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          reason = entry.reason || reason;
          console.debug(`✅ [INFO] Yetkili bulundu: ${executor}, Sebep: ${reason}`);
        } else {
          console.debug('ℹ️ [INFO] Ban yetkilisi bulunamadı.');
        }
      } catch (err) {
        console.warn('⚠️ [WARN] Ban denetim kayıtları alınamadı:', err.message);
      }

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

      await logChannel.send({ embeds: [embed] });
      console.log('✅ [LOG] Ban ekleme logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] guildBanAdd log hatası:', err);
    }
  });

  client.on('guildBanRemove', async (ban) => {
    try {
      console.debug('🔧 [DEBUG] guildBanRemove eventi tetiklendi.');

      const logChannel = ban.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        console.debug('🔍 [DEBUG] Ban kaldırma için denetim kayıtları çekiliyor...');
        const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
        const entry = audit.entries.find(e => e.target.id === ban.user.id);
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.debug(`✅ [INFO] Ban kaldırma yetkilisi bulundu: ${executor}`);
        } else {
          console.debug('ℹ️ [INFO] Ban kaldırma yetkilisi bulunamadı.');
        }
      } catch (err) {
        console.warn('⚠️ [WARN] Ban kaldırma denetim kayıtları alınamadı:', err.message);
      }

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

      await logChannel.send({ embeds: [embed] });
      console.log('✅ [LOG] Ban kaldırma logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] guildBanRemove log hatası:', err);
    }
  });
};
