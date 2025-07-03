const { EmbedBuilder } = require("discord.js");
const logger = require("../utils/logger");
const { getConfigValue } = require('../configService');

module.exports = (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');
  client.on("messageDelete", async (msg) => {
    try {
      logger.debug("🗑️ Mesaj silindi eventi tetiklendi.");

      if (msg.partial) {
        try {
          logger.debug("🧩 Mesaj partial, fetch ediliyor...");
          await msg.fetch();
        } catch (err) {
          logger.warn("⚠️ Mesaj fetch başarısız (muhtemelen silinmiş): " + err.message);
          return;
        }
      }

      if (!msg.guild || msg.author?.bot) {
        logger.debug("ℹ️ Geçersiz sunucu veya bot mesajı, işlem iptal.");
        return;
      }

      const logChannel = msg.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        logger.warn("⚠️ Log kanalı bulunamadı.");
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
      logger.log("✅ Mesaj silme logu başarıyla gönderildi.");
    } catch (err) {
      logger.error("❌ Mesaj silme log hatası:", err);
    }
  });

  client.on("messageUpdate", async (oldMsg, newMsg) => {
    try {
      logger.debug("✏️ Mesaj güncelleme eventi tetiklendi.");

      if (oldMsg.partial || newMsg.partial) {
        try {
          logger.debug("🧩 Partial mesaj tespit edildi, fetch ediliyor...");
          if (oldMsg.partial) await oldMsg.fetch();
          if (newMsg.partial) await newMsg.fetch();
        } catch (err) {
          logger.warn("⚠️ Mesaj fetch başarısız (muhtemelen silinmiş): " + err.message);
          return;
        }
      }

      if (!oldMsg.guild || oldMsg.author?.bot) {
        logger.debug("ℹ️ Geçersiz sunucu veya bot mesajı, işlem iptal.");
        return;
      }

      if (oldMsg.content === newMsg.content) {
        logger.info("🔍 Mesaj içeriği değişmemiş, log gönderilmiyor.");
        return;
      }

      const logChannel = oldMsg.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        logger.warn("⚠️ Log kanalı bulunamadı.");
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
      logger.log("✅ Mesaj düzenleme logu başarıyla gönderildi.");
    } catch (err) {
      logger.error("❌ Mesaj düzenleme log hatası:", err);
    }
  });
};
