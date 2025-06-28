const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const logChannelId = "1387844085787656345";

  client.on('guildMemberUpdate', (oldMember, newMember) => {
    const logChannel = newMember.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const oldRoles = oldMember.roles.cache.map(r => r.id);
    const newRoles = newMember.roles.cache.map(r => r.id);

    const added = newRoles.filter(r => !oldRoles.includes(r));
    const removed = oldRoles.filter(r => !newRoles.includes(r));

    if (added.length === 0 && removed.length === 0) return;

    const embed = new EmbedBuilder()
      .setTitle('🎭 Rol Güncellemesi')
      .setColor('Blurple')
      .setDescription(`Kullanıcı: ${newMember.user.tag}`)
      .setTimestamp();

    if (added.length > 0) {
      embed.addFields({ name: '➕ Verilen Rol(ler)', value: added.map(id => `<@&${id}>`).join(', ') });
    }

    if (removed.length > 0) {
      embed.addFields({ name: '➖ Alınan Rol(ler)', value: removed.map(id => `<@&${id}>`).join(', ') });
    }

    logChannel.send({ embeds: [embed] });
  });
};
