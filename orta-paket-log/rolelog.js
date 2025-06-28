const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844291446968370";

  client.on('guildMemberUpdate', (oldMember, newMember) => {
    const logChannel = newMember.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const oldRoles = oldMember.roles.cache.map(r => r.id);
    const newRoles = newMember.roles.cache.map(r => r.id);

    const added = newRoles.filter(id => !oldRoles.includes(id));
    const removed = oldRoles.filter(id => !newRoles.includes(id));

    if (added.length === 0 && removed.length === 0) return;

    const embed = new EmbedBuilder()
      .setTitle('🎭 Rol Güncellemesi')
      .setColor('Blue')
      .setDescription(`Kullanıcı: ${newMember.user.tag} (${newMember.user.id})`)
      .setTimestamp();

    if (added.length > 0)
      embed.addFields({ name: '➕ Eklenen', value: added.map(id => `<@&${id}>`).join(', ') });

    if (removed.length > 0)
      embed.addFields({ name: '➖ Alınan', value: removed.map(id => `<@&${id}>`).join(', ') });

    logChannel.send({ embeds: [embed] });
  });
};
