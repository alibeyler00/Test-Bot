const { EmbedBuilder } = require("discord.js");
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  console.log('⚙️ messageDelete & messageUpdate log sistemi başlatılıyor...');
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');
  console.log(`🔑 Log kanalı ID alındı: ${logChannelId}`);

  client.on("messageDelete", async (msg) => {
    try {
      console.log('🗑️ messageDelete eventi tetiklendi.');

      if (msg.partial) {
        try {
          console.log('🧩 Partial mesaj tespit edildi, fetch ediliyor...');
          await msg.fetch();
          console.log('✅ Mesaj fetch işlemi başarılı.');
        } catch (err) {
          console.warn('⚠️ Mesaj fetch başarısız (muhtemelen silinmiş):', err.message);
          return;
        }
      }

      if (!msg.guild) {
        console.log('ℹ️ Mesaj sunucuya ait değil, işlem iptal.');
        return;
      }

      if (msg.author?.bot) {
        console.log('ℹ️ Mesaj bot tarafından gönderilmiş, işlem iptal.');
        return;
      }

      const logChannel = msg.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("🗑️ Mesaj Silindi")
        .setColor("#FF5555")
        .setAuthor({
          name: msg.author?.tag || "Bilinmeyen Kullanıcı",
          iconURL: msg.author?.displayAvatarURL() || client.user.displayAvatarURL(),
        })
        .setDescription(
          `**Kullanıcı:** ${msg.author} (\`${msg.author?.id || "??"}\`)\n**Kanal:** <#${msg.channel?.id}> (\`${msg.channel?.id}\`)`
        )
        .addFields([
          {
            name: "Mesaj İçeriği",
            value: msg.content?.slice(0, 1024) || "*[Medya, embed ya da boş mesaj]*",
          },
        ])
        .setFooter({ text: `Mesaj ID: ${msg.id}` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Mesaj silme logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ Mesaj silme log hatası:', err);
    }
  });

  client.on("messageUpdate", async (oldMsg, newMsg) => {
    try {
      console.log('✏️ messageUpdate eventi tetiklendi.');

      if (oldMsg.partial) {
        console.log('🧩 Eski mesaj partial, fetch ediliyor...');
        await oldMsg.fetch();
        console.log('✅ Eski mesaj fetch başarılı.');
      }
      if (newMsg.partial) {
        console.log('🧩 Yeni mesaj partial, fetch ediliyor...');
        await newMsg.fetch();
        console.log('✅ Yeni mesaj fetch başarılı.');
      }

      if (!oldMsg.guild) {
        console.log('ℹ️ Mesaj sunucuya ait değil, işlem iptal.');
        return;
      }

      if (oldMsg.author?.bot) {
        console.log('ℹ️ Mesaj bot tarafından gönderilmiş, işlem iptal.');
        return;
      }

      if (oldMsg.content === newMsg.content) {
        console.log('ℹ️ Mesaj içeriği değişmemiş, log gönderilmiyor.');
        return;
      }

      const logChannel = oldMsg.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        console.warn('⚠️ Log kanalı bulunamadı.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("✏️ Mesaj Düzenlendi")
        .setColor("#FFA500")
        .setAuthor({
          name: oldMsg.author?.tag || "Bilinmeyen Kullanıcı",
          iconURL: oldMsg.author?.displayAvatarURL() || client.user.displayAvatarURL(),
        })
        .setDescription(
          `**Kullanıcı:** ${oldMsg.author} (\`${oldMsg.author?.id || "??"}\`)\n**Kanal:** <#${oldMsg.channel?.id}> (\`${oldMsg.channel?.id}\`)`
        )
        .addFields([
          {
            name: "Eski Mesaj",
            value: oldMsg.content?.slice(0, 1024) || "*[Medya veya Embed]*",
          },
          {
            name: "Yeni Mesaj",
            value: newMsg.content?.slice(0, 1024) || "*[Medya veya Embed]*",
          },
        ])
        .setFooter({ text: `Mesaj ID: ${oldMsg.id}` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log('✅ Mesaj düzenleme logu başarıyla gönderildi.');
    } catch (err) {
      console.error('❌ Mesaj düzenleme log hatası:', err);
    }
  });
};
