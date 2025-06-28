const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const logChannel = newState.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const user = newState.member.user;

    // Katılma
    if (!oldState.channelId && newState.channelId) {
      const embed = new EmbedBuilder()
        .setTitle('🔊 Ses Kanalına Katıldı')
        .setColor('#43B581')
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .addFields(
          { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
          { name: 'Ses Kanalı', value: `<#${newState.channelId}>` }
        )
        .setTimestamp();

      return logChannel.send({ embeds: [embed] });
    }

    // Ayrılma
    if (oldState.channelId && !newState.channelId) {
      const embed = new EmbedBuilder()
        .setTitle('🔈 Ses Kanalından Ayrıldı')
        .setColor('#FF0000')
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .addFields(
          { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
          { name: 'Ses Kanalı', value: `<#${oldState.channelId}>` }
        )
        .setTimestamp();

      return logChannel.send({ embeds: [embed] });
    }

    // Kanal değiştirme
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      const embed = new EmbedBuilder()
        .setTitle('🔄 Ses Kanalı Değiştirildi')
        .setColor('#FFFF00')
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .addFields(
          { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
          { name: 'Eski Kanal', value: `<#${oldState.channelId}>`, inline: true },
          { name: 'Yeni Kanal', value: `<#${newState.channelId}>`, inline: true }
        )
        .setTimestamp();

      return logChannel.send({ embeds: [embed] });
    }
  });
};
