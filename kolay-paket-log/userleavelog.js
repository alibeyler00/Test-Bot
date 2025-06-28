const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844085787656345";

  client.on('guildMemberRemove', (member) => {
    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🔴 Kullanıcı Ayrıldı')
      .setColor('DarkRed')
      .setDescription(`${member.user.tag} sunucudan ayrıldı.`)
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
