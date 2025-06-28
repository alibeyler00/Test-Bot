const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  client.on("messageDelete", async (msg) => {
    try {
      console.debug("🗑️ [DEBUG] Mesaj silindi eventi tetiklendi.");

      if (msg.partial) {
        try {
          console.debug("🧩 [DEBUG] Mesaj partial, fetch ediliyor...");
          await msg.fetch();
        } catch (err) {
          console.warn("⚠️ [WARN] Mesaj fetch başarısız (muhtemelen silinmiş):", err.message);
          return;
        }
      }

      if (!msg.guild || msg.author?.bot) {
        console.debug("ℹ️ [INFO] Geçersiz sunucu veya bot mesajı, işlem iptal.");
        return;
      }

      const logChannel = msg.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn("⚠️ [WARN] Log kanalı bulunamadı.");
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
      console.log("✅ [LOG] Mesaj silme logu başarıyla gönderildi.");
    } catch (err) {
      console.error("❌ [HATA] Mesaj silme log hatası:", err);
    }
  });

  client.on("messageUpdate", async (oldMsg, newMsg) => {
    try {
      console.debug("✏️ [DEBUG] Mesaj güncelleme eventi tetiklendi.");

      if (oldMsg.partial || newMsg.partial) {
        try {
          console.debug("🧩 [DEBUG] Partial mesaj tespit edildi, fetch ediliyor...");
          if (oldMsg.partial) await oldMsg.fetch();
          if (newMsg.partial) await newMsg.fetch();
        } catch (err) {
          console.warn("⚠️ [WARN] Mesaj fetch başarısız (muhtemelen silinmiş):", err.message);
          return;
        }
      }

      if (!oldMsg.guild || oldMsg.author?.bot) {
        console.debug("ℹ️ [INFO] Geçersiz sunucu veya bot mesajı, işlem iptal.");
        return;
      }

      if (oldMsg.content === newMsg.content) {
        console.debug("🔍 [INFO] Mesaj içeriği değişmemiş, log gönderilmiyor.");
        return;
      }

      const logChannel = oldMsg.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn("⚠️ [WARN] Log kanalı bulunamadı.");
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
      console.log("✅ [LOG] Mesaj düzenleme logu başarıyla gönderildi.");
    } catch (err) {
      console.error("❌ [HATA] Mesaj düzenleme log hatası:", err);
    }
  });
};
