const { EmbedBuilder } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  console.log('⏳ Kullanıcı giriş/çıkış log sistemi başlatılıyor...');
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');
  console.log(`🔑 Log kanalı ID: ${logChannelId}`);

  client.on('guildMemberAdd', async (member) => {
    try {
      console.log('🟢 guildMemberAdd tetiklendi.');

      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
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

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Kullanıcı giriş logu gönderildi.');
    } catch (err) {
      console.error('❌ Kullanıcı katılım log hatası:', err);
    }
  });

  client.on('guildMemberRemove', async (member) => {
    try {
      console.log('🔴 guildMemberRemove tetiklendi.');

      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
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

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Kullanıcı çıkış logu gönderildi.');
    } catch (err) {
      console.error('❌ Kullanıcı ayrılma log hatası:', err);
    }
  });
};
