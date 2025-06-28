const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger'); // Logger modül yolunu kendine göre düzenle

module.exports = (client) => {
  client.on('guildMemberAdd', (member) => {
    try {
      logger.debug('🟢 [DEBUG] guildMemberAdd tetiklendi.');

      const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

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
      logger.info('✅ [LOG] Kullanıcı giriş logu gönderildi.');
    } catch (err) {
      logger.error('❌ [HATA] Kullanıcı katılım log hatası:', err);
    }
  });

  client.on('guildMemberRemove', (member) => {
    try {
      logger.debug('🔴 [DEBUG] guildMemberRemove tetiklendi.');

      const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ [WARN] Log kanalı bulunamadı.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(member.user.bot ? '🤖 Bot Sunucudan Ayrıldı' : '🔴 Kullanıcı Ayrıldı')
        .setColor(member.user.bot ? '#1E90FF' : '#FF0000')
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .addFields(
          { name: 'Kullanıcı', value: `${member.user} (\`${member.user.id}\`)`, inline: true },
          {
            name: 'Sunucuda Kalma Süresi',
            value: member.joinedTimestamp
              ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
              : 'Bilinmiyor'
          }
        )
        .setTimestamp()
        .setFooter({ text: `Sunucu: ${member.guild.name}` });

      logChannel.send({ embeds: [embed] });
      logger.info('✅ [LOG] Kullanıcı çıkış logu gönderildi.');
    } catch (err) {
      logger.error('❌ [HATA] Kullanıcı ayrılma log hatası:', err);
    }
  });
};
