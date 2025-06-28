const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844291446968370";

  client.on('guildUpdate', (oldGuild, newGuild) => {
    const logChannel = newGuild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Sunucu Güncellendi')
      .setColor('Blue')
      .setTimestamp();

    if (oldGuild.name !== newGuild.name)
      embed.addFields({ name: 'İsim', value: `**Eski:** ${oldGuild.name}\n**Yeni:** ${newGuild.name}` });

    if (oldGuild.description !== newGuild.description)
      embed.addFields({ name: 'Açıklama', value: `**Eski:** ${oldGuild.description || 'Yok'}\n**Yeni:** ${newGuild.description || 'Yok'}` });

    if (oldGuild.iconURL() !== newGuild.iconURL())
      embed.setThumbnail(newGuild.iconURL());

    if (embed.data.fields?.length > 0) logChannel.send({ embeds: [embed] });
  });
};
