import { ModalSubmitInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { database, getEmbedColor, getButtonText, getConfigRoleAndChannel } from '../utils/database';

export async function modalHandler(interaction: ModalSubmitInteraction) {
  if (!interaction.guild) return;

  const guildConfig = database.getGuildConfig(interaction.guild.id);

  if (interaction.customId === 'application_modal') {
    await handleApplicationSubmission(interaction, guildConfig);
  } else if (interaction.customId.startsWith('rejection_modal_')) {
    await handleRejectionSubmission(interaction, guildConfig);
  }
}

async function handleApplicationSubmission(interaction: ModalSubmitInteraction, guildConfig: any) {
  // Get form data
  const name = interaction.fields.getTextInputValue('name_input');
  const age = interaction.fields.getTextInputValue('age_input');
  const reason = interaction.fields.getTextInputValue('reason_input');
  const experience = interaction.fields.getTextInputValue('experience_input');

  // Validate age
  const ageNumber = parseInt(age);
  if (isNaN(ageNumber) || ageNumber < 13 || ageNumber > 99) {
    await interaction.reply({
      content: '❌ Lütfen geçerli bir yaş girin (13-99 arası)!',
      ephemeral: true
    });
    return;
  }

  // Create application in database
  const application = database.createApplication({
    userId: interaction.user.id,
    guildId: interaction.guild!.id,
    name: name,
    age: age,
    reason: reason,
    experience: experience
  });

  // Send confirmation to user
  await interaction.reply({
    content: '✅ Başvurun başarıyla gönderildi! Sonuç DM ile bildirilecektir.',
    ephemeral: true
  });

  // Send application to log channel
  const configData = getConfigRoleAndChannel();
  const logChannelId = guildConfig.logChannel || configData.logChannel;
  
  if (logChannelId) {
    try {
      const logChannel = await interaction.guild!.channels.fetch(logChannelId);
      
      if (logChannel && (logChannel as any).isTextBased()) {
        const applicationEmbed = new EmbedBuilder()
          .setTitle('📋 Yeni Başvuru')
          .setDescription(`**${interaction.user.tag}** tarafından yeni bir başvuru gönderildi.`)
          .addFields(
            { name: '👤 Kullanıcı', value: `${interaction.user} (${interaction.user.id})`, inline: false },
            { name: '📝 Ad Soyad', value: name, inline: true },
            { name: '🎂 Yaş', value: age, inline: true },
            { name: '📅 Başvuru Tarihi', value: `<t:${Math.floor(application.timestamp / 1000)}:F>`, inline: false },
            { name: '❓ Başvuru Sebebi', value: reason, inline: false },
            { name: '🎯 Deneyimler', value: experience, inline: false }
          )
          .setColor(getEmbedColor('warning'))
          .setThumbnail(interaction.user.displayAvatarURL())
          .setFooter({ text: `Başvuru ID: ${application.id}` })
          .setTimestamp();

        // Create approve/reject buttons
        const approveButton = new ButtonBuilder()
          .setCustomId(`approve_application_${application.id}`)
          .setLabel(getButtonText('approve'))
          .setStyle(ButtonStyle.Success);

        const rejectButton = new ButtonBuilder()
          .setCustomId(`reject_application_${application.id}`)
          .setLabel(getButtonText('reject'))
          .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(approveButton, rejectButton);

        await (logChannel as any).send({
          embeds: [applicationEmbed],
          components: [actionRow]
        });
      }
    } catch (error) {
      console.error('Error sending application to log channel:', error);
    }
  }
}

async function handleRejectionSubmission(interaction: ModalSubmitInteraction, guildConfig: any) {
  const applicationId = interaction.customId.split('_')[2]; // rejection_modal_ID
  const rejectionReason = interaction.fields.getTextInputValue('rejection_reason');

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
    status: 'rejected',
    reviewedBy: interaction.user.id,
    rejectionReason: rejectionReason
  });

  // Find and update the original application message
  try {
    const configData = getConfigRoleAndChannel();
    const logChannelId = guildConfig.logChannel || configData.logChannel;
    
    if (logChannelId) {
      const logChannel = await interaction.guild!.channels.fetch(logChannelId);
      if (logChannel && (logChannel as any).isTextBased()) {
        // Find the application message by searching recent messages
        const messages = await (logChannel as any).messages.fetch({ limit: 50 });
        const applicationMessage = messages.find((msg: any) => 
          msg.embeds.length > 0 && 
          msg.embeds[0].footer && 
          msg.embeds[0].footer.text.includes(`Başvuru ID: ${applicationId}`)
        );
        
        if (applicationMessage) {
          const originalEmbed = applicationMessage.embeds[0];
          const updatedEmbed = new EmbedBuilder(originalEmbed.toJSON())
            .addFields(
              { name: '❌ Durum', value: `**REDDİLDİ**\n👤 Yetkili: ${interaction.user}\n📝 Sebep: ${rejectionReason}`, inline: false }
            )
            .setColor(getEmbedColor('error'));

          await applicationMessage.edit({
            embeds: [updatedEmbed],
            components: [] // Remove buttons
          });
        }
      }
    }
  } catch (error) {
    console.error('Error updating application embed:', error);
  }

  // Send DM to user with embed
  try {
    const user = await interaction.client.users.fetch(application.userId);
    
    const rejectionEmbed = new EmbedBuilder()
      .setTitle('❌ Başvuru Sonucu')
      .setDescription(`**Üzgünüz!** ${interaction.guild!.name} sunucusundaki başvurun **reddedildi**.`)
      .addFields(
        { name: '❌ Durum', value: 'Reddedildi', inline: true },
        { name: '👤 Reddeden', value: interaction.user.username, inline: true },
        { name: '📝 Sebep', value: rejectionReason, inline: false },
        { name: '🔁 Bilgi', value: 'Tekrar başvuru yapabilirsin. İyi günler!', inline: false }
      )
      .setColor(getEmbedColor('error'))
      .setTimestamp();

    await user.send({ embeds: [rejectionEmbed] });

    await interaction.reply({
      content: `✅ Başvuru reddedildi ve kullanıcıya DM gönderildi.`,
      ephemeral: true
    });
  } catch (error) {
    await interaction.reply({
      content: `✅ Başvuru reddedildi ancak kullanıcıya DM gönderilemedi.`,
      ephemeral: true
    });
  }
}