const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('messageReactionAdd', async (reaction, user) => {
    try {
      console.debug('➕ [DEBUG] messageReactionAdd eventi tetiklendi.');

      if (user.bot) return;
      const msg = reaction.message;
      if (!msg.guild) return;

      const logChannel = msg.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
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
      console.log('✅ [LOG] Reaksiyon ekleme logu gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] messageReactionAdd log hatası:', err);
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    try {
      console.debug('➖ [DEBUG] messageReactionRemove eventi tetiklendi.');

      if (user.bot) return;
      const msg = reaction.message;
      if (!msg.guild) return;

      const logChannel = msg.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
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
      console.log('✅ [LOG] Reaksiyon kaldırma logu gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] messageReactionRemove log hatası:', err);
    }
  });
};
