const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const logger = require('../utils/logger'); 

module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
      const logChannel = newState.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) return;

      const user = newState.member.user;
      const embed = new EmbedBuilder()
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setTimestamp();

      if (!oldState.channelId && newState.channelId) {
        embed
          .setTitle('🔊 Ses Kanalına Katıldı')
          .setColor('#43B581')
          .addFields(
            { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
            { name: 'Ses Kanalı', value: `<#${newState.channelId}>` }
          );

        await logChannel.send({ embeds: [embed] });
        logger.info(`✅ ${user.tag} ses kanalına katıldı.`);
        return;
      }

      if (oldState.channelId && !newState.channelId) {
        embed
          .setTitle('🔈 Ses Kanalından Ayrıldı')
          .setColor('#FF0000')
          .addFields(
            { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
            { name: 'Ses Kanalı', value: `<#${oldState.channelId}>` }
          );

        await logChannel.send({ embeds: [embed] });
        logger.info(`✅ ${user.tag} ses kanalından ayrıldı.`);
        return;
      }

      if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        embed
          .setTitle('🔄 Ses Kanalı Değiştirildi')
          .setColor('#FFFF00')
          .addFields(
            { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
            { name: 'Eski Kanal', value: `<#${oldState.channelId}>`, inline: true },
            { name: 'Yeni Kanal', value: `<#${newState.channelId}>`, inline: true }
          );

        await logChannel.send({ embeds: [embed] });
        logger.info(`✅ ${user.tag} ses kanalı değiştirdi.`);
        return;
      }

      if (oldState.selfMute !== newState.selfMute) {
        embed
          .setTitle('🎙️ Mikrofon Durumu Değişti')
          .setColor(newState.selfMute ? '#FF0000' : '#43B581')
          .addFields(
            { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
            { name: 'Durum', value: newState.selfMute ? 'Mikrofonu kapattı' : 'Mikrofonu açtı' }
          );

        await logChannel.send({ embeds: [embed] });
        logger.info(`✅ ${user.tag} mikrofon durumunu değiştirdi.`);
        return;
      }

      if (oldState.selfDeaf !== newState.selfDeaf) {
        embed
          .setTitle('🎧 Kulaklık Durumu Değişti')
          .setColor(newState.selfDeaf ? '#FF0000' : '#43B581')
          .addFields(
            { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
            { name: 'Durum', value: newState.selfDeaf ? 'Kulaklığını kapattı (Deafen)' : 'Kulaklığını açtı (Un-Deafen)' }
          );

        await logChannel.send({ embeds: [embed] });
        logger.info(`✅ ${user.tag} kulaklık durumunu değiştirdi.`);
        return;
      }

      if (oldState.serverMute !== newState.serverMute) {
        embed
          .setTitle('🔇 Sunucu Mikrofon Durumu Değişti')
          .setColor(newState.serverMute ? '#FF4500' : '#00FF00')
          .addFields(
            { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
            { name: 'Durum', value: newState.serverMute ? 'Sunucu tarafından mikrofona kapatıldı' : 'Sunucu tarafından mikrofona açıldı' }
          );

        await logChannel.send({ embeds: [embed] });
        logger.info(`✅ ${user.tag} sunucu mikrofon durumunu değiştirdi.`);
        return;
      }

      if (oldState.serverDeaf !== newState.serverDeaf) {
        embed
          .setTitle('🔇 Sunucu Kulaklık Durumu Değişti')
          .setColor(newState.serverDeaf ? '#FF4500' : '#00FF00')
          .addFields(
            { name: 'Kullanıcı', value: `${user} (\`${user.id}\`)` },
            { name: 'Durum', value: newState.serverDeaf ? 'Sunucu tarafından kulaklık kapatıldı' : 'Sunucu tarafından kulaklık açıldı' }
          );

        await logChannel.send({ embeds: [embed] });
        logger.info(`✅ ${user.tag} sunucu kulaklık durumunu değiştirdi.`);
        return;
      }
    } catch (error) {
      logger.error('❌ [HATA] voiceStateUpdate log hatası:', error);
    }
  });
};
