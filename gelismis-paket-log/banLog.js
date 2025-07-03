const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');

  client.on('guildBanAdd', async (ban) => {
    try {
      const logChannel = ban.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';
      let reason = ban.reason || 'Sebep belirtilmemiş';

      try {
        const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 5 });
        const entry = audit.entries.find(e => e.target.id === ban.user.id);
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          reason = entry.reason || reason;
        }
      } catch (err) {
        console.warn('⚠️ Ban denetim kayıtları alınamadı:', err.message);
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
      console.log('✅ Ban ekleme logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ guildBanAdd log hatası:', err);
    }
  });

  client.on('guildBanRemove', async (ban) => {
    try {
      const logChannel = ban.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';

      try {
        const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 5 });
        const entry = audit.entries.find(e => e.target.id === ban.user.id);
        if (entry) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
        }
      } catch (err) {
        console.warn('⚠️ Ban kaldırma denetim kayıtları alınamadı:', err.message);
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
      console.log('✅ Ban kaldırma logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ guildBanRemove log hatası:', err);
    }
  });
};
