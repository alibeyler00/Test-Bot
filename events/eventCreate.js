const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = async (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_ticket_category') {
        const guild = interaction.guild;
        const member = interaction.member;
        const userId = member.id;
        const category = interaction.values[0]; // örneğin: 'teknik_sorun'

        // Zaten açık ticket var mı kontrolü
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
        const rawRoles = await getConfigValue('TICKET_AUTHORIZED_ROLES');
        const staffRoles = rawRoles?.split(',').map(r => r.trim()) || [];

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

        const embed = new EmbedBuilder()
          .setTitle('🎫 Ticket Açıldı')
          .setDescription(`Kategori: \`${category}\`\nHoş geldin <@${userId}>, destek ekibi seninle ilgilenecek.`)
          .setColor('Green');

        const closeButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🎯 Ticketı Kapat')
            .setStyle(ButtonStyle.Danger)
        );

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
              { name: 'Kategori', value: category, inline: true },
              { name: 'Kanal', value: `${ticketChannel}`, inline: true }
            )
            .setColor('Blue')
            .setTimestamp();

          logChannel.send({ embeds: [logEmbed] });
        }
      }
    }
  });

};
