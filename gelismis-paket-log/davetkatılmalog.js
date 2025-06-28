const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

const invites = new Map();

module.exports = (client) => {
  client.on('ready', async () => {
    try {
      logger.debug('🔧 Bot hazır, davet listeleri yükleniyor...');

      for (const guild of client.guilds.cache.values()) {
        try {
          const firstInvites = await guild.invites.fetch();
          invites.set(guild.id, new Map(firstInvites.map(invite => [invite.code, invite.uses])));
          logger.log(`✅ ${guild.name} (${guild.id}) için davetler önbelleğe alındı.`);
        } catch (err) {
          logger.warn(`⚠️ ${guild.name} (${guild.id}) davetleri alınamadı: ${err.message}`);
        }
      }
    } catch (err) {
      logger.error('❌ Davet önbellekleme hatası:', err);
    }
  });

  client.on('inviteCreate', (invite) => {
    try {
      const guildInvites = invites.get(invite.guild.id);
      if (guildInvites) {
        guildInvites.set(invite.code, invite.uses);
        logger.debug(`🔄 Yeni davet oluşturuldu: ${invite.code} (${invite.uses} kullanım)`);
      } else {
        logger.warn(`⚠️ Davet güncellenemedi, önbellek bulunamadı: ${invite.guild.id}`);
      }
    } catch (err) {
      logger.error('❌ inviteCreate eventi hatası:', err);
    }
  });

  client.on('guildMemberAdd', async (member) => {
    try {
      logger.debug('🔧 guildMemberAdd (davet takibi) eventi tetiklendi.');

      const newInvites = await member.guild.invites.fetch();
      const oldInvites = invites.get(member.guild.id);

      if (!oldInvites) {
        logger.warn('⚠️ Eski davetler önbellekte yok, güncelleme yapılıyor.');
        invites.set(member.guild.id, new Map(newInvites.map(i => [i.code, i.uses])));
        return;
      }

      const usedInvite = newInvites.find(i => {
        const oldUse = oldInvites.get(i.code) || 0;
        return i.uses > oldUse;
      });

      const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
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
      logger.log(`✅ ${member.user.tag} kullanıcısının davet logu başarıyla gönderildi.`);

      invites.set(member.guild.id, new Map(newInvites.map(i => [i.code, i.uses])));
    } catch (err) {
      logger.error('❌ guildMemberAdd davet log hatası:', err);
    }
  });
};
