const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844085787656345";

  client.on('messageDelete', async (message) => {
    if (message.partial) await message.fetch();
    if (message.author?.bot) return;

    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('📩 Mesaj Silindi')
      .setColor('Red')
      .addFields(
        { name: 'Kullanıcı', value: `${message.author.tag}`, inline: true },
        { name: 'Kanal', value: `${message.channel.name}`, inline: true },
        { name: 'Mesaj', value: message.content || '[Embed veya Medya]' }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
