const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844085787656345";

  client.on('guildBanRemove', (ban) => {
    const logChannel = ban.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('✅ Ban Kaldırıldı')
      .setColor('Green')
      .setDescription(`${ban.user.tag} adlı kullanıcının yasağı kaldırıldı.`)
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
