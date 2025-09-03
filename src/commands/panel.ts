import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { database, getEmbedColor, getButtonText, getConfigRoleAndChannel } from '../utils/database';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Başvuru panelini kurar')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'Bu komut sadece sunucularda kullanılabilir!',
        ephemeral: true
      });
      return;
    }

    // Check if setup is complete
    const guildConfig = database.getGuildConfig(interaction.guild.id);
    const configData = getConfigRoleAndChannel();
    
    const applicationRole = guildConfig.applicationRole || configData.applicationRole;
    const logChannel = guildConfig.logChannel || configData.logChannel;
    
    if (!applicationRole || !logChannel) {
      await interaction.reply({
        content: '❌ Önce `/setup` komutunu kullanarak sistem ayarlarını tamamlayın!',
        ephemeral: true
      });
      return;
    }

    // Create embed for application panel
    const panelEmbed = new EmbedBuilder()
      .setTitle('📋 ZoneReal - Başvuru Sistemi')
      .setDescription(
        '🎯 **Ekibimize katılmak ister misin?**\n\n' +
        '📝 Aşağıdaki butona tıklayarak başvuru formunu doldurabilirsin.\n' +
        '⏰ Başvurun incelendikten sonra sonuç DM ile bildirilecektir.\n\n' +
        '🔹 **Başvuru Şartları:**\n' +
        '• En az 15 yaşında olmalısın\n' +
        '• Discord kurallarına uymalısın\n' +
        '• Aktif ve saygılı olmalısın\n\n' +
        '✨ Başarılar!'
      )
      .setColor(getEmbedColor('panel'))
      .setTimestamp();

    const guildIcon = interaction.guild.iconURL();
    if (guildIcon) {
      panelEmbed.setThumbnail(guildIcon);
      panelEmbed.setFooter({
        text: `${interaction.guild.name} Başvuru Sistemi`,
        iconURL: guildIcon
      });
    } else {
      panelEmbed.setFooter({
        text: `${interaction.guild.name} Başvuru Sistemi`
      });
    }

    // Create button for application
    const applyButton = new ButtonBuilder()
      .setCustomId('apply_button')
      .setLabel(getButtonText('apply'))
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📝');

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(applyButton);

    // Send the panel
    const panelMessage = await interaction.reply({
      embeds: [panelEmbed],
      components: [row],
      fetchReply: true
    });

    // Save panel information to database
    database.setGuildConfig(interaction.guild.id, {
      panelChannel: interaction.channel?.id,
      panelMessageId: panelMessage.id
    });

    // Send confirmation message
    const confirmEmbed = new EmbedBuilder()
      .setTitle('✅ Panel Kuruldu')
      .setDescription('Başvuru paneli başarıyla kuruldu!')
      .setColor(getEmbedColor('success'))
      .setTimestamp();

    await interaction.followUp({
      embeds: [confirmEmbed],
      ephemeral: true
    });
  }
};