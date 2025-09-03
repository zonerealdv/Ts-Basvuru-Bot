import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { database, getEmbedColor, updateConfigFile } from '../utils/database';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Başvuru sistemi ayarlarını yapılandır')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Başvuru kabul edilince verilecek rol')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('logkanal')
        .setDescription('Başvuruların gönderileceği log kanalı')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'Bu komut sadece sunucularda kullanılabilir!',
        ephemeral: true
      });
      return;
    }

    const role = interaction.options.getRole('role', true);
    const logChannel = interaction.options.getChannel('logkanal', true);

    // Verify channel is a text channel
    if (!(logChannel as any).isTextBased()) {
      await interaction.reply({
        content: 'Log kanalı metin kanalı olmalıdır!',
        ephemeral: true
      });
      return;
    }

    // Save configuration to database
    database.setGuildConfig(interaction.guild.id, {
      applicationRole: role.id,
      logChannel: logChannel.id
    });
    
    // Also save to config.json file
    updateConfigFile({
      applicationRole: role.id,
      logChannel: logChannel.id
    });

    const embed = new EmbedBuilder()
      .setTitle('✅ Başvuru Sistemi Ayarları')
      .setDescription('Başvuru sistemi başarıyla yapılandırıldı!')
      .addFields(
        { name: '👤 Başvuru Rolü', value: `${role}`, inline: true },
        { name: '📋 Log Kanalı', value: `${logChannel}`, inline: true }
      )
      .setColor(getEmbedColor('success'))
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};