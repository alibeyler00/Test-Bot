const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844291446968370";

  client.on('channelCreate', (channel) => {
    const logChannel = channel.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('📁 Kanal Oluşturuldu')
      .setColor('Green')
      .addFields(
        { name: 'Kanal', value: `${channel.name} (${channel.id})` },
        { name: 'Tür', value: `${channel.type}` }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('channelDelete', (channel) => {
    const logChannel = channel.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Kanal Silindi')
      .setColor('Red')
      .addFields(
        { name: 'Kanal', value: `${channel.name} (${channel.id})` },
        { name: 'Tür', value: `${channel.type}` }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
