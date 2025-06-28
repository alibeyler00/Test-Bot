const { EmbedBuilder } = require('discord.js');

const invites = new Map();

module.exports = (client) => {
  client.on('ready', async () => {
    client.guilds.cache.forEach(async (guild) => {
      const firstInvites = await guild.invites.fetch();
      invites.set(guild.id, new Map(firstInvites.map((invite) => [invite.code, invite.uses])));
    });
  });

  client.on('inviteCreate', invite => {
    const guildInvites = invites.get(invite.guild.id);
    guildInvites.set(invite.code, invite.uses);
  });

  client.on('guildMemberAdd', async member => {
    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id);

    const usedInvite = newInvites.find(i => {
      const oldUse = oldInvites.get(i.code);
      return oldUse < i.uses;
    });

    const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('📨 Yeni Kullanıcı Katıldı (Davet ile)')
      .setColor('#1abc9c')
      .addFields(
        { name: 'Kullanıcı', value: `${member.user.tag} (\`${member.id}\`)`, inline: false },
        { name: 'Davet Kodu', value: usedInvite?.code || 'Bilinmiyor', inline: true },
        { name: 'Davet Eden', value: usedInvite?.inviter?.tag || 'Bilinmiyor', inline: true }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
    invites.set(member.guild.id, new Map(newInvites.map((invite) => [invite.code, invite.uses])));
  });
};
