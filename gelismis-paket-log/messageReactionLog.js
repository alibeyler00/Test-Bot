const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    const msg = reaction.message;
    if (!msg.guild) return;

    const logChannel = msg.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('➕ Reaksiyon Eklendi')
      .setColor('#00FF00')
      .setDescription(`${user} kullanıcısı <#${msg.channel.id}> kanalındaki mesaja reaksiyon ekledi.`)
      .addFields(
        { name: 'Reaksiyon', value: reaction.emoji.toString() },
        { name: 'Mesaj ID', value: msg.id }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    const msg = reaction.message;
    if (!msg.guild) return;

    const logChannel = msg.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('➖ Reaksiyon Kaldırıldı')
      .setColor('#FF0000')
      .setDescription(`${user} kullanıcısı <#${msg.channel.id}> kanalındaki mesaja reaksiyonunu kaldırdı.`)
      .addFields(
        { name: 'Reaksiyon', value: reaction.emoji.toString() },
        { name: 'Mesaj ID', value: msg.id }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
