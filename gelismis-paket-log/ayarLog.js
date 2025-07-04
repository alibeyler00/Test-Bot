const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');

  client.on('guildUpdate', async (oldGuild, newGuild) => {
    try {
      const logChannel = newGuild.channels.cache.get(logChannelId);
      if (!logChannel) return;

      let changes = [];

      if (oldGuild.name !== newGuild.name)
        changes.push(`**Sunucu Adı:** \`${oldGuild.name}\` → \`${newGuild.name}\``);
      if (oldGuild.icon !== newGuild.icon)
        changes.push('🖼️ Sunucu ikonu değiştirildi.');
      if (oldGuild.description !== newGuild.description)
        changes.push(`**Açıklama:** \`${oldGuild.description || "Yok"}\` → \`${newGuild.description || "Yok"}\``);
      if (oldGuild.vanityURLCode !== newGuild.vanityURLCode)
        changes.push(`**Özel URL:** \`${oldGuild.vanityURLCode || "Yok"}\` → \`${newGuild.vanityURLCode || "Yok"}\``);
      if (oldGuild.region !== newGuild.region)
        changes.push(`**Sunucu Bölgesi:** \`${oldGuild.region || "Bilinmiyor"}\` → \`${newGuild.region || "Bilinmiyor"}\``);

      if (changes.length === 0) {
        // Değişiklik yoksa işlem yok
        return;
      }

      let executor = 'Bilinmiyor';
      try {
        const audit = await newGuild.fetchAuditLogs({ type: AuditLogEvent.GuildUpdate, limit: 1 });
        const entry = audit.entries.first();
        if (entry && entry.executor) {
          executor = `${entry.executor.tag} (\`${entry.executor.id}\`)`;
        }
      } catch {
        // Audit log alınamazsa sessiz geç
      }

      const embed = new EmbedBuilder()
        .setTitle('⚙️ Sunucu Ayarları Güncellendi')
        .setColor('#FFA500')
        .setDescription(changes.join('\n'))
        .setFooter({ text: `Yetkili: ${executor}` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });

    } catch (error) {
      // Hata varsa konsola yaz (logger yok)
      console.error('guildUpdate log hatası:', error);
    }
  });
};
