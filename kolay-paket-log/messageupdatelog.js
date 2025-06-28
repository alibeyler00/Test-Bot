const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844085787656345";

  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.partial || newMessage.partial) return;
    if (oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const logChannel = oldMessage.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('✏️ Mesaj Düzenlendi')
      .setColor('Orange')
      .addFields(
        { name: 'Kullanıcı', value: `${oldMessage.author.tag}` },
        { name: 'Kanal', value: `${oldMessage.channel.name}` },
        { name: 'Eski Mesaj', value: oldMessage.content || '[boş]' },
        { name: 'Yeni Mesaj', value: newMessage.content || '[boş]' },
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
