const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844291446968370";

  client.on('emojiCreate', (emoji) => {
    const embed = new EmbedBuilder()
      .setTitle('🆕 Emoji Eklendi')
      .setColor('Green')
      .setDescription(`**Ad:** \`${emoji.name}\`\n**ID:** ${emoji.id}`)
      .setThumbnail(emoji.url)
      .setTimestamp();

    emoji.guild.channels.cache.get(logChannelId)?.send({ embeds: [embed] });
  });

  client.on('emojiDelete', (emoji) => {
    const embed = new EmbedBuilder()
      .setTitle('❌ Emoji Silindi')
      .setColor('Red')
      .setDescription(`**Ad:** \`${emoji.name}\`\n**ID:** ${emoji.id}`)
      .setTimestamp();

    emoji.guild.channels.cache.get(logChannelId)?.send({ embeds: [embed] });
  });

  client.on('emojiUpdate', (oldEmoji, newEmoji) => {
    if (oldEmoji.name === newEmoji.name) return;

    const embed = new EmbedBuilder()
      .setTitle('✏️ Emoji Güncellendi')
      .setColor('Orange')
      .addFields(
        { name: 'Önce', value: oldEmoji.name },
        { name: 'Sonra', value: newEmoji.name }
      )
      .setTimestamp();

    newEmoji.guild.channels.cache.get(logChannelId)?.send({ embeds: [embed] });
  });
};
