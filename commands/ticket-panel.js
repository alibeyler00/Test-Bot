const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
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
      .setTitle('🎫 Destek Talebi Oluştur')
      .setDescription('Aşağıdan bir kategori seçerek destek talebi oluşturabilirsin.')
      .setColor('Blurple');

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_ticket_category')
      .setPlaceholder('Bir kategori seçin...')
      .addOptions([
        {
          label: '🎧 Genel Destek',
          value: 'genel_destek',
          description: 'Genel bir destek talebi oluştur.',
        },
        {
          label: '🛠️ Teknik Sorun',
          value: 'teknik_sorun',
          description: 'Teknik bir sorun bildir.',
        },
        {
          label: '📩 Başvuru',
          value: 'basvuru',
          description: 'Bir pozisyona başvur.',
        }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await ticketChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Select menülü ticket paneli gönderildi.', ephemeral: true });
  },
};
