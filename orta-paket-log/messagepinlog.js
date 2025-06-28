const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844291446968370";

  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.partial || newMessage.partial) return;
    if (oldMessage.pinned === newMessage.pinned) return;

    const logChannel = newMessage.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(newMessage.pinned ? 'Blue' : 'Grey')
      .setTitle(newMessage.pinned ? '📌 Mesaj Sabitlendi' : '❌ Sabitleme Kaldırıldı')
      .addFields(
        { name: 'Kullanıcı', value: newMessage.author?.tag || 'Bilinmiyor' },
        { name: 'Kanal', value: newMessage.channel.name },
        { name: 'Mesaj', value: newMessage.content || '[Embed/Medya]' }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
