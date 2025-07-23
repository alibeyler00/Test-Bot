const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: '❌ Komut çalıştırılırken bir hata oluştu.',
          ephemeral: true,
        });
      }
    }
    
    if (!interaction.isButton()) return;

    const guild = interaction.guild;
    const member = interaction.member;
    const userId = member.id;

    // === Ticket Açma ===
    if (interaction.customId === 'create_ticket') {
      // Kullanıcının zaten bir ticket kanalı var mı?
      const existing = guild.channels.cache.find(c =>
        c.name === `ticket-${userId}` && c.parentId !== null
      );

      if (existing) {
        return interaction.reply({
          content: '📌 Zaten bir açık ticketin var!',
          ephemeral: true,
        });
      }

      // Yetkili roller
      const staffRolesRaw = await getConfigValue("TICKET_AUTHORIZED_ROLES"); // örn: "123,456"
      const staffRoles = staffRolesRaw?.split(',').map(r => r.trim()) || [];

      // Ticket kanalı oluştur
      const ticketChannel = await guild.channels.create({
        name: `ticket-${userId}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: userId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
            ],
          },
          ...staffRoles.map(roleId => ({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          })),
        ],
      });

      // Embed mesaj
      const embed = new EmbedBuilder()
        .setTitle('🎫 Ticket Açıldı')
        .setDescription(`Hoş geldin ${member}, destek ekibi en kısa sürede seninle ilgilenecektir.`)
        .setColor('Green')
        .setTimestamp();

      // 🎯 Ticket kapatma butonu
      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('🎯 Ticketı Kapat')
          .setStyle(ButtonStyle.Danger)
      );

      // Embed + Buton gönder
      await ticketChannel.send({
        content: `<@${userId}>`,
        embeds: [embed],
        components: [closeButton],
      });

      await interaction.reply({
        content: `✅ Ticket kanalın oluşturuldu: ${ticketChannel}`,
        ephemeral: true,
      });

      // Log
      const logChannelId = await getConfigValue("LOG_CHANNEL_ID");
      const logChannel = guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('🎟️ Yeni Ticket Açıldı')
          .addFields(
            { name: 'Kullanıcı', value: `<@${userId}>`, inline: true },
            { name: 'Kanal', value: `${ticketChannel}`, inline: true }
          )
          .setColor('Blue')
          .setTimestamp();

        logChannel.send({ embeds: [logEmbed] });
      }
    }

    // === Ticket Kapatma ===
    // === Ticket Kapatma ===
    if (interaction.customId === 'close_ticket') {
      const staffRolesRaw = await getConfigValue("TICKET_AUTHORIZED_ROLES");
      const staffRoles = staffRolesRaw?.split(',').map(r => r.trim()) || [];

      const isAuthorized = member.roles.cache.some(role => staffRoles.includes(role.id));
      if (!isAuthorized) {
        return interaction.reply({
          content: '🚫 Bu ticketı kapatmak için yetkin yok.',
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: '✅ Ticket 5 saniye içinde kapatılıyor...',
        ephemeral: true,
      });

      const logChannelId = await getConfigValue("LOG_CHANNEL_ID");
      const logChannel = interaction.guild.channels.cache.get(logChannelId);

      const closingEmbed = new EmbedBuilder()
        .setTitle('🎫 Ticket Kapatıldı')
        .addFields(
          { name: 'Kapatan', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Kanal', value: `${interaction.channel.name}`, inline: true }
        )
        .setColor('Red')
        .setTimestamp();

      if (logChannel) {
        logChannel.send({ embeds: [closingEmbed] });
      }

      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 5000);
    }

  });
  client.on('messageCreate', async (message) => {
    // Bot mesajlarını ve DM'leri yoksay
    if (message.author.bot || !message.guild) return;

    const prefix = '!'; // Burayı istediğin gibi değiştirebilirsin

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args); // execute fonksiyonu mesaj tabanlı komutları desteklemeli
    } catch (error) {
      console.error(error);
      await message.reply('❌ Komutu çalıştırırken bir hata oluştu.');
    }
  });
};
