const { EmbedBuilder } = require('discord.js');
const { getConfigValue } = require('../configService');

const invites = new Map();

module.exports = async (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');

  client.on('ready', async () => {
    try {
      for (const guild of client.guilds.cache.values()) {
        try {
          const firstInvites = await guild.invites.fetch();
          invites.set(guild.id, new Map(firstInvites.map(invite => [invite.code, invite.uses])));
          console.log(`✅ ${guild.name} (${guild.id}) için davetler önbelleğe alındı.`);
        } catch (err) {
          console.warn(`⚠️ ${guild.name} (${guild.id}) davetleri alınamadı: ${err.message}`);
        }
      }
    } catch (err) {
      console.error('❌ Davet önbellekleme hatası:', err);
    }
  });

  client.on('inviteCreate', (invite) => {
    try {
      const guildInvites = invites.get(invite.guild.id);
      if (guildInvites) {
        guildInvites.set(invite.code, invite.uses);
        console.log(`🔄 Yeni davet oluşturuldu: ${invite.code} (${invite.uses} kullanım)`);
      } else {
        console.warn(`⚠️ Davet güncellenemedi, önbellek bulunamadı: ${invite.guild.id}`);
      }
    } catch (err) {
      console.error('❌ inviteCreate eventi hatası:', err);
    }
  });

  client.on('guildMemberAdd', async (member) => {
    try {
      const newInvites = await member.guild.invites.fetch();
      const oldInvites = invites.get(member.guild.id);

      if (!oldInvites) {
        console.warn('⚠️ Eski davetler önbellekte yok, güncelleme yapılıyor.');
        invites.set(member.guild.id, new Map(newInvites.map(i => [i.code, i.uses])));
        return;
      }

      const usedInvite = newInvites.find(i => {
        const oldUse = oldInvites.get(i.code) || 0;
        return i.uses > oldUse;
      });

      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('📨 Yeni Kullanıcı Katıldı (Davet ile)')
        .setColor('#1abc9c')
        .addFields(
          { name: 'Kullanıcı', value: `${member.user.tag} (\`${member.id}\`)`, inline: false },
          { name: 'Davet Kodu', value: usedInvite?.code || 'Bilinmiyor', inline: true },
          { name: 'Davet Eden', value: usedInvite?.inviter?.tag || 'Bilinmiyor', inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log(`✅ ${member.user.tag} kullanıcısının davet logu başarıyla gönderildi.`);

      invites.set(member.guild.id, new Map(newInvites.map(i => [i.code, i.uses])));
    } catch (err) {
      console.error('❌ guildMemberAdd davet log hatası:', err);
    }
  });
};
