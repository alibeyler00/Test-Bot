const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
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
    if (!channel.guild) return;
    const logChannel = getLogChannel(channel.guild);
    if (!logChannel) return;

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
  });

  client.on("channelDelete", async (channel) => {
    if (!channel.guild) return;
    const logChannel = getLogChannel(channel.guild);
    if (!logChannel) return;

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
  });

  client.on("channelUpdate", async (oldChannel, newChannel) => {
    if (!oldChannel.guild) return;
    const logChannel = getLogChannel(oldChannel.guild);
    if (!logChannel) return;

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

    if (nameChanged || topicChanged || changedPerms.length > 0) {
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

      await logChannel.send({ embeds: [embed] });
    }
  });
};
