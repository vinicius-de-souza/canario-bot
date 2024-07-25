const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const bodyParser = require("body-parser");
const winston = require("winston"); // For logging

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

// Discord bot setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = "1266074055702876192"; // The channel where the threads are created

// Express server setup
const app = express();
app.use(bodyParser.json());

// Log when the client is ready
client.once("ready", () => {
  logger.info(`Logged in as ${client.user.tag}!`);
});

// Function to find the thread by issue key
const findThreadByIssueKey = async (issueKey) => {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    const threads = await channel.threads.fetchActive();
    return threads.threads.find((thread) => thread.name.includes(issueKey));
  } catch (error) {
    logger.error(`Error finding thread: ${error.message}`);
    throw error;
  }
};

// Endpoint to receive Jira webhooks
app.post("/jira-webhook", async (req, res) => {
  try {
    logger.info("Received webhook request:", req.body);

    const issue = req.body.issue;
    if (!issue) {
      logger.warn("No issue data in webhook request");
      return res.status(400).send("Bad Request: No issue data");
    }

    const issueKey = issue.key;
    const issueStatus = issue.fields.status.name;
    const message = `Issue ${issueKey} status updated to ${issueStatus}`;

    // Find the thread for the specific issue
    const thread = await findThreadByIssueKey(issueKey);

    if (thread) {
      // Send message to the specific Discord thread
      await thread.send(message);
      logger.info(`Message sent to thread ${thread.id}: ${message}`);
      res.status(200).send("OK");
    } else {
      logger.warn(`Thread for issue ${issueKey} not found`);
      res.status(404).send("Thread not found");
    }
  } catch (error) {
    logger.error(`Error processing webhook request: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

client
  .login(DISCORD_TOKEN)
  .then(() => logger.info("Discord bot logged in successfully"))
  .catch((error) =>
    logger.error(`Error logging in to Discord: ${error.message}`)
  );

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
