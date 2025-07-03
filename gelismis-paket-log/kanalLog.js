const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const logger = require("../utils/logger");
const { getConfigValue } = require('../configService');

module.exports = (client) => {
  const logChannelId = await getConfigValue('LOG_CHANNEL_ID');
  const typeMap = {
    [ChannelType.GuildText]: "Metin Kanalı",
    [ChannelType.GuildVoice]: "Ses Kanalı",
    [ChannelType.GuildCategory]: "Kategori",
    [ChannelType.GuildAnnouncement]: "Duyuru Kanalı",
    [ChannelType.GuildStageVoice]: "Sahne Kanalı",
    [ChannelType.GuildForum]: "Forum Kanalı"
  };

  const getLogChannel = (guild) => guild.channels.cache.get(logChannelId);

  client.on("channelCreate", async (channel) => {
    try {
      logger.debug("📥 channelCreate eventi tetiklendi.");

      if (!channel.guild) return;
      const logChannel = getLogChannel(channel.guild);
      if (!logChannel) {
        logger.warn("⚠️ Log kanalı bulunamadı.");
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("📥 Yeni Kanal Oluşturuldu")
        .setColor("Green")
        .addFields(
          { name: "İsim", value: channel.name, inline: true },
          { name: "Tür", value: typeMap[channel.type] || "Bilinmeyen", inline: true },
          { name: "ID", value: channel.id.toString(), inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log("✅ Kanal oluşturma logu gönderildi.");
    } catch (err) {
      logger.error("❌ channelCreate log hatası:", err);
    }
  });

  client.on("channelDelete", async (channel) => {
    try {
      logger.debug("🗑️ channelDelete eventi tetiklendi.");

      if (!channel.guild) return;
      const logChannel = getLogChannel(channel.guild);
      if (!logChannel) {
        logger.warn("⚠️ Log kanalı bulunamadı.");
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("🗑️ Kanal Silindi")
        .setColor("Red")
        .addFields(
          { name: "İsim", value: channel.name, inline: true },
          { name: "Tür", value: typeMap[channel.type] || "Bilinmeyen", inline: true },
          { name: "ID", value: channel.id.toString(), inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.log("✅ Kanal silme logu gönderildi.");
    } catch (err) {
      logger.error("❌ channelDelete log hatası:", err);
    }
  });

  client.on("channelUpdate", async (oldChannel, newChannel) => {
    try {
      logger.debug("🔧 channelUpdate eventi tetiklendi.");

      if (!oldChannel.guild) return;
      const logChannel = getLogChannel(oldChannel.guild);
      if (!logChannel) {
        logger.warn("⚠️ Log kanalı bulunamadı.");
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("🔧 Kanal Güncellemesi")
        .setColor("Yellow")
        .addFields({ name: "Kanal", value: `<#${oldChannel.id}> (\`${oldChannel.id}\`)` })
        .setTimestamp();

      const nameChanged = oldChannel.name !== newChannel.name;
      const topicChanged = oldChannel.topic !== newChannel.topic;

      if (nameChanged) {
        embed.addFields(
          { name: "Eski İsim", value: oldChannel.name, inline: true },
          { name: "Yeni İsim", value: newChannel.name, inline: true }
        );
      }

      if (topicChanged) {
        embed.addFields(
          { name: "Eski Konu", value: oldChannel.topic || "*Yok*", inline: true },
          { name: "Yeni Konu", value: newChannel.topic || "*Yok*", inline: true }
        );
      }

      const oldOverwrites = oldChannel.permissionOverwrites.cache;
      const newOverwrites = newChannel.permissionOverwrites.cache;
      const changedPerms = [];

      for (const [id, newPerm] of newOverwrites) {
        const oldPerm = oldOverwrites.get(id);
        if (!oldPerm) continue;

        const added = new PermissionsBitField(newPerm.allow.bitfield)
          .remove(oldPerm.allow.bitfield)
          .toArray();
        const removed = new PermissionsBitField(oldPerm.allow.bitfield)
          .remove(newPerm.allow.bitfield)
          .toArray();

        if (added.length || removed.length) {
          const target = await oldChannel.guild.roles.fetch(id).catch(() => null)
                      || await oldChannel.guild.members.fetch(id).catch(() => null);
          changedPerms.push({
            name: target?.name || target?.user?.tag || "Bilinmiyor",
            id,
            added,
            removed
          });
        }
      }

      if (changedPerms.length > 0) {
        for (const change of changedPerms) {
          const valueLines = [];
          if (change.added.length) valueLines.push(`✅ Eklenen: \`${change.added.join(", ")}\``);
          if (change.removed.length) valueLines.push(`❌ Kaldırılan: \`${change.removed.join(", ")}\``);

          embed.addFields({
            name: `🎯 İzin Değişikliği - ${change.name} (${change.id})`,
            value: valueLines.join("\n"),
            inline: false
          });
        }
      }

      if (nameChanged || topicChanged || changedPerms.length > 0) {
        await logChannel.send({ embeds: [embed] });
        logger.log("✅ Kanal güncelleme logu gönderildi.");
      } else {
        logger.info("ℹ️ Önemli bir değişiklik yok, log atlanıyor.");
      }
    } catch (err) {
      logger.error("❌ channelUpdate log hatası:", err);
    }
  });
};
