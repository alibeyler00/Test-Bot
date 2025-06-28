const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844085787656345";

  client.on('guildMemberAdd', (member) => {
    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🟢 Kullanıcı Katıldı')
      .setColor('Green')
      .setDescription(`${member.user.tag} sunucuya katıldı.`)
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
