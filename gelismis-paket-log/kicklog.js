const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');

  client.on('guildMemberRemove', async (member) => {
    try {
      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      let kicked = false;
      let executor = 'Bilinmiyor';
      let reason = 'Belirtilmedi';

      try {
        const audit = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
        const entry = audit.entries.first();

        if (entry) {
          const now = Date.now();
          const diff = now - entry.createdTimestamp;

          if (entry.target?.id === member.id && diff < 5000) {
            kicked = true;
            executor = entry.executor ? `${entry.executor.tag} (\`${entry.executor.id}\`)` : 'Bilinmiyor';
            reason = entry.reason || reason;
          }
        }
      } catch {}

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

      await logChannel.send({ embeds: [embed] });
    } catch (err) {
      console.error('guildMemberRemove (kick) log hatası:', err);
    }
  });
};
