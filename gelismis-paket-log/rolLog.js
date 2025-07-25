const { EmbedBuilder, AuditLogEvent, PermissionsBitField } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  console.log('⚙️ Rol log sistemi başlatılıyor...');
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');
  console.log(`🔑 Log kanalı ID alındı: ${logChannelId}`);

  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      console.log('🔧 guildMemberUpdate eventi tetiklendi.');

      const logChannel = newMember.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

      if (addedRoles.size === 0 && removedRoles.size === 0) {
        console.log('ℹ️ Rol değişikliği yok, log atlanıyor.');
        return;
      }

      let executor = 'Bilinmiyor';
      try {
        const auditLogs = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 5 });
        const entry = auditLogs.entries.find(e => e.target.id === newMember.id);
        if (entry && entry.executor) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.log(`✅ Yetkili bulundu: ${executor}`);
        }
      } catch (err) {
        console.warn('⚠️ Rol güncelleme denetim kayıtları alınamadı:', err.message);
      }

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

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Rol güncelleme logu gönderildi.');
    } catch (err) {
      console.error('❌ guildMemberUpdate log hatası:', err);
    }
  });

  client.on('roleCreate', async (role) => {
    try {
      console.log('📝 roleCreate eventi tetiklendi.');

      const logChannel = role.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';
      try {
        const audit = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 });
        const entry = audit.entries.first();
        if (entry && entry.executor) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.log(`✅ Rolü oluşturan yetkili: ${executor}`);
        }
      } catch (err) {
        console.warn('⚠️ Rol oluşturma denetim kayıtları alınamadı:', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('📌 Rol Oluşturuldu')
        .setColor('#57F287')
        .addFields(
          { name: 'Rol', value: `${role} (\`${role.id}\`)` },
          { name: 'Yetkili', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });

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

        await logChannel.send({ embeds: [warnEmbed] });
        console.warn('⚠️ Tehlikeli izin uyarısı gönderildi.');
      }
    } catch (err) {
      console.error('❌ roleCreate log hatası:', err);
    }
  });

  client.on('roleDelete', async (role) => {
    try {
      console.log('🗑️ roleDelete eventi tetiklendi.');

      const logChannel = role.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      let executor = 'Bilinmiyor';
      try {
        const audit = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 });
        const entry = audit.entries.first();
        if (entry && entry.executor) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.log(`✅ Rolü silen yetkili: ${executor}`);
        }
      } catch (err) {
        console.warn('⚠️ Rol silme denetim kayıtları alınamadı:', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Rol Silindi')
        .setColor('#ED4245')
        .addFields(
          { name: 'Rol', value: `\`${role.name}\` (\`${role.id}\`)` },
          { name: 'Yetkili', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Rol silme logu gönderildi.');
    } catch (err) {
      console.error('❌ roleDelete log hatası:', err);
    }
  });

  client.on('roleUpdate', async (oldRole, newRole) => {
    try {
      console.log('✏️ roleUpdate eventi tetiklendi.');

      const logChannel = newRole.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const changes = [];
      if (oldRole.name !== newRole.name) {
        changes.push(`**İsim:** \`${oldRole.name}\` → \`${newRole.name}\``);
      }
      if (oldRole.color !== newRole.color) {
        changes.push(`**Renk:** \`#${oldRole.color.toString(16).padStart(6, '0')}\` → \`#${newRole.color.toString(16).padStart(6, '0')}\``);
      }
      if (!oldRole.permissions.equals(newRole.permissions)) {
        const oldPerms = oldRole.permissions.toArray();
        const newPerms = newRole.permissions.toArray();
        const added = newPerms.filter(p => !oldPerms.includes(p));
        const removed = oldPerms.filter(p => !newPerms.includes(p));

        if (added.length) changes.push(`✅ Eklenen Yetkiler: \`${added.join(', ')}\``);
        if (removed.length) changes.push(`❌ Kaldırılan Yetkiler: \`${removed.join(', ')}\``);
      }

      if (changes.length === 0) {
        console.log('ℹ️ Rolde anlamlı bir değişiklik yok, log atlanıyor.');
        return;
      }

      let executor = 'Bilinmiyor';
      try {
        const audit = await newRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate, limit: 1 });
        const entry = audit.entries.first();
        if (entry && entry.executor) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
          console.log(`✅ Rolü güncelleyen yetkili: ${executor}`);
        }
      } catch (err) {
        console.warn('⚠️ Rol güncelleme denetim kayıtları alınamadı:', err.message);
      }

      const embed = new EmbedBuilder()
        .setTitle('✏️ Rol Güncellendi')
        .setColor('#FEE75C')
        .setDescription(changes.join('\n'))
        .addFields(
          { name: 'Rol', value: `${newRole} (\`${newRole.id}\`)` },
          { name: 'Yetkili', value: executor }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Rol güncelleme logu gönderildi.');
    } catch (err) {
      console.error('❌ roleUpdate log hatası:', err);
    }
  });
};
