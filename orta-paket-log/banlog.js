const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844291446968370";

  client.on('guildBanAdd', async (ban) => {
    const logChannel = ban.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const fetchedLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
    const banLog = fetchedLogs.entries.first();
    const executor = banLog?.executor;

    const embed = new EmbedBuilder()
      .setTitle('🚫 Kullanıcı Yasaklandı')
      .setColor('Red')
      .addFields(
        { name: 'Kullanıcı', value: `${ban.user.tag} (${ban.user.id})` },
        { name: 'Yetkili', value: executor ? `${executor.tag} (${executor.id})` : 'Bilinmiyor' },
        { name: 'Sebep', value: ban.reason || 'Belirtilmemiş' }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('guildBanRemove', async (ban) => {
    const logChannel = ban.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';

    try {
      const fetchedLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
      const unbanLog = fetchedLogs.entries.find(entry => entry.target.id === ban.user.id);

      if (unbanLog) {
        executor = `${unbanLog.executor.tag} (${unbanLog.executor.id})`;
      }
    } catch (err) {
      console.error('❌ Ban kaldırma audit log alınamadı:', err.message);
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Ban Kaldırıldı')
      .setColor('Green')
      .addFields(
        { name: 'Kullanıcı', value: `${ban.user.tag} (${ban.user.id})` },
        { name: 'Yetkili', value: executor }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
