const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getConfigValue } = require('../configService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Ticket panel mesajını gönderir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const ticketChannelId = await getConfigValue('TICKET_MESSAGE_CHANNEL');
    if (!ticketChannelId) return interaction.reply({ content: 'Ticket mesaj kanalı ayarlanmamış!', ephemeral: true });

    const ticketChannel = interaction.guild.channels.cache.get(ticketChannelId);
    if (!ticketChannel || ticketChannel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: 'Ticket mesaj kanalı geçersiz veya bulunamadı.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎫 Destek Talebi Aç')
      .setDescription('Bir sorun yaşıyorsan aşağıdaki butona tıklayarak destek talebi oluşturabilirsin.')
      .setColor('Blurple')
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Ticket Aç')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📩');

    const row = new ActionRowBuilder().addComponents(button);

    await ticketChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Ticket panel mesajı gönderildi.', ephemeral: true });
  },
};
