const { EmbedBuilder, AuditLogEvent, PermissionsBitField } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const logChannel = newMember.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
    const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

    if (addedRoles.size === 0 && removedRoles.size === 0) return;

    let executor = 'Bilinmiyor';
    try {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 5 });
      const entry = auditLogs.entries.find(e => e.target.id === newMember.id);
      if (entry && entry.executor) executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
    } catch {}

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Rol Güncellemesi')
      .setColor('#FFD700')
      .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
      .addFields(
        { name: 'Kullanıcı', value: `${newMember.user} (\`${newMember.user.id}\`)`, inline: true },
        { name: 'Yetkili', value: executor, inline: true }
      )
      .setFooter({ text: `Sunucu: ${newMember.guild.name}` })
      .setTimestamp();

    if (addedRoles.size > 0) {
      embed.addFields({ name: '✅ Eklenen Roller', value: addedRoles.map(r => r.toString()).join(', ') });
    }

    if (removedRoles.size > 0) {
      embed.addFields({ name: '❌ Alınan Roller', value: removedRoles.map(r => r.toString()).join(', ') });
    }

    logChannel.send({ embeds: [embed] });
  });

  client.on('roleCreate', async (role) => {
    const logChannel = role.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';
    try {
      const audit = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 });
      const entry = audit.entries.first();
      if (entry && entry.executor) {
        executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
      }
    } catch {}

    const embed = new EmbedBuilder()
      .setTitle('📌 Rol Oluşturuldu')
      .setColor('#57F287')
      .addFields(
        { name: 'Rol', value: `${role} (\`${role.id}\`)` },
        { name: 'Yetkili', value: executor }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });

    const dangerous = [
      'Administrator',
      'BanMembers',
      'ManageGuild',
      'ManageRoles',
      'ManageChannels',
      'KickMembers'
    ];

    const granted = dangerous.filter(perm => role.permissions.has(PermissionsBitField.Flags[perm]));
    if (granted.length > 0) {
      const warnEmbed = new EmbedBuilder()
        .setTitle('🚨 Yüksek Yetkili Rol Oluşturuldu!')
        .setColor('#e67e22')
        .addFields(
          { name: 'Rol', value: `${role.name} (\`${role.id}\`)`, inline: true },
          { name: 'Tehlikeli İzinler', value: granted.map(p => `\`${p}\``).join(', ') }
        )
        .setTimestamp();

      logChannel.send({ embeds: [warnEmbed] });
    }
  });

  client.on('roleDelete', async (role) => {
    const logChannel = role.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    let executor = 'Bilinmiyor';
    try {
      const audit = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 });
      const entry = audit.entries.first();
      if (entry && entry.executor) {
        executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
      }
    } catch {}

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Rol Silindi')
      .setColor('#ED4245')
      .addFields(
        { name: 'Rol', value: `\`${role.name}\` (\`${role.id}\`)` },
        { name: 'Yetkili', value: executor }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  client.on('roleUpdate', async (oldRole, newRole) => {
    const logChannel = newRole.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return;

    const changes = [];

    if (oldRole.name !== newRole.name) {
      changes.push(`**İsim:** \`${oldRole.name}\` → \`${newRole.name}\``);
    }

    if (oldRole.color !== newRole.color) {
      changes.push(`**Renk:** \`#${oldRole.color.toString(16)}\` → \`#${newRole.color.toString(16)}\``);
    }

    if (!oldRole.permissions.equals(newRole.permissions)) {
      const oldPerms = oldRole.permissions.toArray();
      const newPerms = newRole.permissions.toArray();

      const added = newPerms.filter(p => !oldPerms.includes(p));
      const removed = oldPerms.filter(p => !newPerms.includes(p));

      if (added.length) changes.push(`✅ Eklenen Yetkiler: \`${added.join(', ')}\``);
      if (removed.length) changes.push(`❌ Kaldırılan Yetkiler: \`${removed.join(', ')}\``);
    }

    if (changes.length === 0) return;

    let executor = 'Bilinmiyor';
    try {
      const audit = await newRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate, limit: 1 });
      const entry = audit.entries.first();
      if (entry && entry.executor) {
        executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
      }
    } catch {}

    const embed = new EmbedBuilder()
      .setTitle('✏️ Rol Güncellendi')
      .setColor('#FEE75C')
      .setDescription(changes.join('\n'))
      .addFields(
        { name: 'Rol', value: `${newRole} (\`${newRole.id}\`)` },
        { name: 'Yetkili', value: executor }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
