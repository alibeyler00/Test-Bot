const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844291446968370";

  client.on('messageDelete', async (message) => {
    if (message.partial) await message.fetch();
    if (!message.guild || message.author?.bot) return;

    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Mesaj Silindi')
      .setColor('Red')
      .addFields(
        { name: 'Kullanıcı', value: `${message.author.tag} (${message.author.id})`, inline: false },
        { name: 'Kanal', value: `${message.channel} (${message.channel.id})`, inline: false },
        { name: 'İçerik', value: message.content || '*[Medya veya embed]*', inline: false },
        { name: 'Mesaj ID', value: message.id, inline: true }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.partial || newMessage.partial) return;
    if (!oldMessage.guild || oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const logChannel = oldMessage.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('✏️ Mesaj Düzenlendi')
      .setColor('Orange')
      .addFields(
        { name: 'Kullanıcı', value: `${oldMessage.author.tag} (${oldMessage.author.id})` },
        { name: 'Kanal', value: `${oldMessage.channel} (${oldMessage.channel.id})` },
        { name: 'Önce', value: oldMessage.content || '*[Boş]*' },
        { name: 'Sonra', value: newMessage.content || '*[Boş]*' },
        { name: 'Mesaj ID', value: oldMessage.id }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
