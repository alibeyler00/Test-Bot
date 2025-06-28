const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberAdd', (member) => {
    const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle(member.user.bot ? '🤖 Bot Sunucuya Katıldı' : '🟢 Kullanıcı Katıldı')
      .setColor(member.user.bot ? '#1E90FF' : '#43B581')
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .addFields(
        { name: 'Kullanıcı', value: `${member.user} (\`${member.user.id}\`)`, inline: true },
        { name: 'Hesap Oluşturma', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Sunucuya Katılma', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` }
      )
      .setTimestamp()
      .setFooter({ text: `Sunucu: ${member.guild.name}` });

    logChannel.send({ embeds: [embed] });
  });

  client.on('guildMemberRemove', (member) => {
    const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle(member.user.bot ? '🤖 Bot Sunucudan Ayrıldı' : '🔴 Kullanıcı Ayrıldı')
      .setColor(member.user.bot ? '#1E90FF' : '#FF0000')
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .addFields(
        { name: 'Kullanıcı', value: `${member.user} (\`${member.user.id}\`)`, inline: true },
        { name: 'Sunucuda Kalma Süresi', value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Bilinmiyor' }
      )
      .setTimestamp()
      .setFooter({ text: `Sunucu: ${member.guild.name}` });

    logChannel.send({ embeds: [embed] });
  });
};
