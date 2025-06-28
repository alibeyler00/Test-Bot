const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      console.debug('🔧 [DEBUG] guildMemberAdd eventi tetiklendi.');

      if (!member.user.bot) {
        console.debug('ℹ️ [INFO] Sunucuya katılan kişi bot değil, işlem yapılmayacak.');
        return;
      }

      const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
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
      console.log('✅ [LOG] Bot sunucuya katılma logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] guildMemberAdd log hatası:', err);
    }
  });

  client.on('guildMemberRemove', async (member) => {
    try {
      console.debug('🔧 [DEBUG] guildMemberRemove eventi tetiklendi.');

      if (!member.user.bot) {
        console.debug('ℹ️ [INFO] Sunucudan ayrılan kişi bot değil, işlem yapılmayacak.');
        return;
      }

      const logChannel = member.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('⚠️ [WARN] Log kanalı bulunamadı.');
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
      console.log('✅ [LOG] Bot sunucudan ayrılma logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ [HATA] guildMemberRemove log hatası:', err);
    }
  });
};
