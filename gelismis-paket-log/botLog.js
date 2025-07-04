const { EmbedBuilder } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');

  client.on('guildMemberAdd', async (member) => {
    try {
      if (!member.user.bot) {
        console.log('ℹ️ Sunucuya katılan kişi bot değil, işlem yapılmayacak.');
        return;
      }

      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
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
      console.log('✅ Bot sunucuya katılma logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ guildMemberAdd log hatası:', err);
    }
  });

  client.on('guildMemberRemove', async (member) => {
    try {
      if (!member.user.bot) {
        console.log('ℹ️ Sunucudan ayrılan kişi bot değil, işlem yapılmayacak.');
        return;
      }

      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
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
      console.log('✅ Bot sunucudan ayrılma logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ guildMemberRemove log hatası:', err);
    }
  });
};
