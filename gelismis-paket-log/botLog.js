const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger'); // Logger'ı dahil et

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      logger.debug('🔧 guildMemberAdd eventi tetiklendi.');

      if (!member.user.bot) {
        logger.info('ℹ️ Sunucuya katılan kişi bot değil, işlem yapılmayacak.');
        return;
      }

      const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Sunucuya Katıldı')
        .setColor('#7289DA')
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .addFields(
          { name: 'Bot', value: `${member.user} (\`${member.user.id}\`)` },
          { name: 'Sunucu', value: member.guild.name }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log('✅ Bot sunucuya katılma logu başarıyla gönderildi.');
    } catch (err) {
      logger.error('❌ guildMemberAdd log hatası:', err);
    }
  });

  client.on('guildMemberRemove', async (member) => {
    try {
      logger.debug('🔧 guildMemberRemove eventi tetiklendi.');

      if (!member.user.bot) {
        logger.info('ℹ️ Sunucudan ayrılan kişi bot değil, işlem yapılmayacak.');
        return;
      }

      const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Sunucudan Ayrıldı')
        .setColor('#7289DA')
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .addFields(
          { name: 'Bot', value: `${member.user} (\`${member.user.id}\`)` },
          { name: 'Sunucu', value: member.guild.name }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log('✅ Bot sunucudan ayrılma logu başarıyla gönderildi.');
    } catch (err) {
      logger.error('❌ guildMemberRemove log hatası:', err);
    }
  });
};
