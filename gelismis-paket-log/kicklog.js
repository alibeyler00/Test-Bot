const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberRemove', async (member) => {
    const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let kicked = false;
    let executor = 'Bilinmiyor';
    let reason = 'Belirtilmedi';

    try {
      const audit = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
      const entry = audit.entries.first();

      const now = Date.now();
      if (entry && entry.target?.id === member.id && now - entry.createdTimestamp < 5000) {
        kicked = true;
        executor = entry.executor ? `${entry.executor.tag} (\`${entry.executor.id}\`)` : 'Bilinmiyor';
        reason = entry.reason || reason;
      }
    } catch (err) {
      console.error('Kick log hatası:', err);
    }

    if (!kicked) return;

    const embed = new EmbedBuilder()
      .setTitle('🥾 Kullanıcı Sunucudan Atıldı (Kick)')
      .setColor('#ED4245')
      .addFields(
        { name: 'Kullanıcı', value: `${member.user.tag} (\`${member.id}\`)` },
        { name: 'Yetkili', value: executor },
        { name: 'Sebep', value: reason }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
