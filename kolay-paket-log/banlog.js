const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844085787656345";

  client.on('guildBanAdd', (ban) => {
    const logChannel = ban.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('⛔ Kullanıcı Banlandı')
      .setColor('Red')
      .setDescription(`${ban.user.tag} sunucudan yasaklandı.`)
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
