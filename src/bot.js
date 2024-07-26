const { Client, GatewayIntentBits } = require("discord.js");
const logger = require("./utils/logger");
const { findOrCreateThread } = require("./utils/threadManager");
const config = require("../config/config.json");
require("dotenv").config();

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

module.exports = client;
