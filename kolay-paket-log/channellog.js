const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844085787656345"; 

  client.on('channelCreate', (channel) => {
    const logChannel = channel.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('📁 Kanal Oluşturuldu')
      .setColor('Green')
      .setDescription(`Kanal adı: \`${channel.name}\` (${channel.type})`)
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('channelDelete', (channel) => {
    const logChannel = channel.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Kanal Silindi')
      .setColor('Red')
      .setDescription(`Silinen kanal: \`${channel.name}\` (${channel.type})`)
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
