const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberAdd', (member) => {
    if (!member.user.bot) return;

    const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Sunucuya Katıldı')
      .setColor('#7289DA')
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .addFields(
        { name: 'Bot', value: `${member.user} (\`${member.user.id}\`)` },
        { name: 'Sunucu', value: member.guild.name }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('guildMemberRemove', (member) => {
    if (!member.user.bot) return;

    const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Sunucudan Ayrıldı')
      .setColor('#7289DA')
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .addFields(
        { name: 'Bot', value: `${member.user} (\`${member.user.id}\`)` },
        { name: 'Sunucu', value: member.guild.name }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
