import { Client, GatewayIntentBits, Collection, Events, REST, Routes, SlashCommandBuilder, ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import * as config from './config.json';
import { readdirSync } from 'fs';
import { join } from 'path';

// Define command interface
interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: any) => Promise<void>;
}

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ]
});

// Create a collection to store commands
const commands = new Collection<string, Command>();

// Load commands
const commandsPath = join(__dirname, 'src', 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command: Command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Load handlers
const handlersPath = join(__dirname, 'src', 'handlers');
try {
  const handlerFiles = readdirSync(handlersPath).filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'));
  
  for (const file of handlerFiles) {
    const filePath = join(handlersPath, file);
    require(filePath)(client);
  }
} catch (error) {
  console.log('[INFO] Handlers directory not found or empty');
}

// When the client is ready, run this code
client.once(Events.ClientReady, async () => {
  console.log(`Ready! Logged in as ${client.user?.tag}`);
  
  // Set bot status/activity
  client.user?.setPresence({
    activities: [{
      name: 'ZoneReal-Başvuru Botu',
      type: 0 // PLAYING
    }],
    status: 'online'
  });
  
  console.log('Bot status set successfully!');
  
  // Register slash commands
  try {
    console.log('Started refreshing application (/) commands.');
    
    const rest = new REST().setToken(config.token);
    const commandData = Array.from(commands.values()).map((command: Command) => command.data.toJSON());
    
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commandData },
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction: any) => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }
    
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Error executing command:', error);
      
      const errorResponse = {
        content: 'Bu komutu çalıştırırken bir hata oluştu!',
        ephemeral: true
      };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorResponse);
      } else {
        await interaction.reply(errorResponse);
      }
    }
  }
  
  // Handle button interactions
  else if (interaction.isButton()) {
    const { buttonHandler } = require('./src/handlers/buttonHandler');
    await buttonHandler(interaction as ButtonInteraction);
  }
  
  // Handle modal submissions
  else if (interaction.isModalSubmit()) {
    const { modalHandler } = require('./src/handlers/modalHandler');
    await modalHandler(interaction as ModalSubmitInteraction);
  }
});

// Log in to Discord
client.login(config.token);