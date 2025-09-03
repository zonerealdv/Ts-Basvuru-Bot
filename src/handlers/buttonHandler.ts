import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { database, getEmbedColor, getButtonText, getConfigRoleAndChannel } from '../utils/database';

export async function buttonHandler(interaction: ButtonInteraction) {
  if (!interaction.guild) return;

  const guildConfig = database.getGuildConfig(interaction.guild.id);

  if (interaction.customId === 'apply_button') {
    await handleApplyButton(interaction, guildConfig);
  } else if (interaction.customId.startsWith('approve_application_')) {
    await handleApproveApplication(interaction, guildConfig);
  } else if (interaction.customId.startsWith('reject_application_')) {
    await handleRejectButton(interaction);
  } else {
    await interaction.reply({
      content: 'Bilinmeyen buton etkileşimi!',
      ephemeral: true
    });
  }
}

async function handleApplyButton(interaction: ButtonInteraction, guildConfig: any) {
  // Check if user already has a pending application
  const existingApplications = database.getApplicationsByUser(interaction.user.id, interaction.guild!.id);
  const pendingApplication = existingApplications.find(app => app.status === 'pending');
  
  if (pendingApplication) {
    await interaction.reply({
      content: '❌ Zaten beklemede olan bir başvurun var! Lütfen sonucunu bekle.',
      ephemeral: true
    });
    return;
  }

  // Check if user already has the application role
  const member = await interaction.guild!.members.fetch(interaction.user.id);
  const configData = getConfigRoleAndChannel();
  const applicationRole = guildConfig.applicationRole || configData.applicationRole;
  
  if (applicationRole && member.roles.cache.has(applicationRole)) {
    await interaction.reply({
      content: '❌ Zaten başvuru rolüne sahipsin!',
      ephemeral: true
    });
    return;
  }

  // Create application modal
  const modal = new ModalBuilder()
    .setCustomId('application_modal')
    .setTitle('📋 Başvuru Formu');

  // Create text inputs
  const nameInput = new TextInputBuilder()
    .setCustomId('name_input')
    .setLabel('Adın Soyadın')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Örnek: Mehmet Yılmaz')
    .setRequired(true)
    .setMaxLength(50);

  const ageInput = new TextInputBuilder()
    .setCustomId('age_input')
    .setLabel('Yaşın')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Örnek: 18')
    .setRequired(true)
    .setMaxLength(2);

  const reasonInput = new TextInputBuilder()
    .setCustomId('reason_input')
    .setLabel('Neden başvuruyorsun?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Başvuru sebebini detaylı bir şekilde açıkla...')
    .setRequired(true)
    .setMaxLength(500);

  const experienceInput = new TextInputBuilder()
    .setCustomId('experience_input')
    .setLabel('Deneyimlerinden bahset')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Daha önceki deneyimlerini, yeteneklerini vb. anlat...')
    .setRequired(true)
    .setMaxLength(500);

  // Create action rows
  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
  const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(ageInput);
  const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
  const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(experienceInput);

  modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

  await interaction.showModal(modal);
}

async function handleApproveApplication(interaction: ButtonInteraction, guildConfig: any) {
  if (!interaction.memberPermissions?.has('Administrator')) {
    await interaction.reply({
      content: '❌ Bu işlemi yapmak için yetkiniz yok!',
      ephemeral: true
    });
    return;
  }

  const applicationId = interaction.customId.split('_')[2]; // approve_application_ID
  const application = database.getApplication(applicationId);

  if (!application) {
    await interaction.reply({
      content: '❌ Başvuru bulunamadı!',
      ephemeral: true
    });
    return;
  }

  if (application.status !== 'pending') {
    await interaction.reply({
      content: '❌ Bu başvuru zaten işlenmiş!',
      ephemeral: true
    });
    return;
  }

  // Update application status
  database.updateApplication(applicationId, {
    status: 'approved',
    reviewedBy: interaction.user.id
  });

  // Update the original embed message
  try {
    const originalEmbed = interaction.message.embeds[0];
    const updatedEmbed = new (await import('discord.js')).EmbedBuilder(originalEmbed.toJSON())
      .addFields(
        { name: '✅ Durum', value: `**ONAYLANDI**\n👤 Yetkili: ${interaction.user}`, inline: false }
      )
      .setColor(getEmbedColor('success'));

    await interaction.message.edit({
      embeds: [updatedEmbed],
      components: [] // Remove buttons
    });
  } catch (error) {
    console.error('Error updating embed:', error);
  }

  // Give role to user
  try {
    const member = await interaction.guild!.members.fetch(application.userId);
    const configData = getConfigRoleAndChannel();
    const applicationRole = guildConfig.applicationRole || configData.applicationRole;
    
    if (applicationRole) {
      await member.roles.add(applicationRole);
    }

    // Send DM to user
    try {
      const approvalEmbed = new (await import('discord.js')).EmbedBuilder()
        .setTitle('🎉 Başvuru Sonucu')
        .setDescription(`**Tebrikler!** ${interaction.guild!.name} sunucusundaki başvurun **onaylandı**!`)
        .addFields(
          { name: '🎆 Durum', value: 'Onaylandı', inline: true },
          { name: '👤 Onaylayan', value: interaction.user.username, inline: true },
          { name: '🎉 Mesaj', value: 'Artık ekibimizin bir parçasısın. Hoş geldin!', inline: false }
        )
        .setColor(getEmbedColor('success'))
        .setTimestamp();

      await member.send({ embeds: [approvalEmbed] });
    } catch (error) {
      console.log('Could not send DM to user:', error);
    }

    await interaction.reply({
      content: `✅ Başvuru onaylandı! ${member} kullanıcısına rol verildi ve DM gönderildi.`,
      ephemeral: true
    });

  } catch (error) {
    await interaction.reply({
      content: '❌ Kullanıcıya rol verirken bir hata oluştu!',
      ephemeral: true
    });
  }
}

async function handleRejectButton(interaction: ButtonInteraction) {
  if (!interaction.memberPermissions?.has('Administrator')) {
    await interaction.reply({
      content: '❌ Bu işlemi yapmak için yetkiniz yok!',
      ephemeral: true
    });
    return;
  }

  const applicationId = interaction.customId.split('_')[2]; // reject_application_ID
  
  // Create rejection reason modal
  const modal = new ModalBuilder()
    .setCustomId(`rejection_modal_${applicationId}`)
    .setTitle('❌ Başvuru Reddetme Sebebi');

  const reasonInput = new TextInputBuilder()
    .setCustomId('rejection_reason')
    .setLabel('Reddetme Sebebi')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Başvurunun neden reddedildiğini açıklayın...')
    .setRequired(true)
    .setMaxLength(500);

  const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
  modal.addComponents(actionRow);

  await interaction.showModal(modal);
}