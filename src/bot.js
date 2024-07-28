const { Client, GatewayIntentBits } = require("discord.js");
const logger = require("./utils/logger");
require("dotenv").config();
const {
  handleNotificarCommand,
  handleListarNotificacoesCommand,
  handleHelpCommand,
} = require("./events/handleCommands");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client
  .login(process.env.DISCORD_TOKEN)
  .then(() => logger.info("Successfully logged in Discord"))
  .catch((error) => logger.error(`Error logging in Discord: ${error.message}`));

client.once("ready", () => {
  logger.info(`Logged as ${client.user.tag}!`);
});

// Listen for slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "notificar") {
    await handleNotificarCommand(interaction);
  } else if (commandName === "listar_notificacoes") {
    await handleListarNotificacoesCommand(interaction, client);
  } else if (commandName === "help") {
    await handleHelpCommand(interaction);
  }
});

module.exports = client;
