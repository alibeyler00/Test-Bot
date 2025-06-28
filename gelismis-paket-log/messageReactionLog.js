const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = (client) => {
  client.on('messageReactionAdd', async (reaction, user) => {
    try {
      logger.debug('➕ Reaksiyon eklendi eventi tetiklendi.');

      if (user.bot) return;
      const msg = reaction.message;
      if (!msg.guild) return;

      const logChannel = msg.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('➕ Reaksiyon Eklendi')
        .setColor('#00FF00')
        .setDescription(`${user} kullanıcısı <#${msg.channel.id}> kanalındaki mesaja reaksiyon ekledi.`)
        .addFields(
          { name: 'Reaksiyon', value: reaction.emoji.toString(), inline: true },
          { name: 'Mesaj ID', value: msg.id, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log('✅ Reaksiyon ekleme logu başarıyla gönderildi.');
    } catch (err) {
      logger.error('❌ messageReactionAdd log hatası:', err);
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    try {
      logger.debug('➖ Reaksiyon kaldırıldı eventi tetiklendi.');

      if (user.bot) return;
      const msg = reaction.message;
      if (!msg.guild) return;

      const logChannel = msg.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        logger.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('➖ Reaksiyon Kaldırıldı')
        .setColor('#FF0000')
        .setDescription(`${user} kullanıcısı <#${msg.channel.id}> kanalındaki mesaja reaksiyonunu kaldırdı.`)
        .addFields(
          { name: 'Reaksiyon', value: reaction.emoji.toString(), inline: true },
          { name: 'Mesaj ID', value: msg.id, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log('✅ Reaksiyon kaldırma logu başarıyla gönderildi.');
    } catch (err) {
      logger.error('❌ messageReactionRemove log hatası:', err);
    }
  });
};
