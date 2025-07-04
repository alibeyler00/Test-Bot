const { EmbedBuilder } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  console.log('⚙️ messageReactionAdd & messageReactionRemove log sistemi başlatılıyor...');
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');
  console.log(`🔑 Log kanalı ID alındı: ${logChannelId}`);

  client.on('messageReactionAdd', async (reaction, user) => {
    try {
      console.log('➕ messageReactionAdd eventi tetiklendi.');

      if (user.bot) {
        console.log('ℹ️ Reaksiyonu bot ekledi, işlem iptal.');
        return;
      }
      const msg = reaction.message;
      if (!msg.guild) {
        console.log('ℹ️ Mesaj sunucuya ait değil, işlem iptal.');
        return;
      }

      const logChannel = msg.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
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
      console.log('✅ Reaksiyon ekleme logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ messageReactionAdd log hatası:', err);
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    try {
      console.log('➖ messageReactionRemove eventi tetiklendi.');

      if (user.bot) {
        console.log('ℹ️ Reaksiyonu bot kaldırdı, işlem iptal.');
        return;
      }
      const msg = reaction.message;
      if (!msg.guild) {
        console.log('ℹ️ Mesaj sunucuya ait değil, işlem iptal.');
        return;
      }

      const logChannel = msg.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
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
      console.log('✅ Reaksiyon kaldırma logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ messageReactionRemove log hatası:', err);
    }
  });
};
