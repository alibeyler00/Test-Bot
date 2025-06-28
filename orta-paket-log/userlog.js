const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844291446968370";

  client.on('guildMemberAdd', (member) => {
    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🟢 Kullanıcı Katıldı')
      .setColor('Green')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'Kullanıcı', value: `${member.user.tag} (${member.user.id})` },
        { name: 'Hesap Oluşturulma', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('guildMemberRemove', async (member) => {
    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🔴 Kullanıcı Ayrıldı')
      .setColor('DarkRed')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'Kullanıcı', value: `${member.user.tag} (${member.user.id})` },
        { name: 'Sunucuya Katılma', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
