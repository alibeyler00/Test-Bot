const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setConfigValue } = require('../configService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-ayar')
    .setDescription('Ticket sistemini yapılandırır')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('mesajkanali')
        .setDescription('Ticket mesajının atılacağı kanal')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('yetkililer')
        .setDescription('Yetkili rol IDlerini virgülle ayırarak gir')
        .setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel('mesajkanali');
    const rawRoles = interaction.options.getString('yetkililer');

    const roles = rawRoles.split(',').map(r => r.trim()).filter(r => /^\d+$/.test(r));

    if (!roles.length) {
      return interaction.reply({ content: 'Geçerli rol IDleri girilmedi!', ephemeral: true });
    }

    await setConfigValue('TICKET_MESSAGE_CHANNEL', channel.id);
    await setConfigValue('TICKET_AUTHORIZED_ROLES', roles.join(','));

    return interaction.reply({ content: `✅ Ticket ayarları kaydedildi:\n- Kanal: <#${channel.id}>\n- Yetkili Roller: ${roles.map(id => `<@&${id}>`).join(', ')}`, ephemeral: true });
  }
};
