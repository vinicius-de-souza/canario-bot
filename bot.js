const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const bodyParser = require("body-parser");

// Discord bot setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Use MessageContent for message content
  ],
});

const DISCORD_TOKEN = "YOUR_DISCORD_BOT_TOKEN";
const CHANNEL_ID = "YOUR_DISCORD_CHANNEL_ID"; // The channel where the threads are created

// Express server setup
const app = express();
app.use(bodyParser.json());

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Function to find the thread by issue key
const findThreadByIssueKey = async (issueKey) => {
  const channel = await client.channels.fetch(CHANNEL_ID);
  const threads = await channel.threads.fetchActive();
  return threads.threads.find((thread) => thread.name.includes(issueKey));
};

// Endpoint to receive Jira webhooks
app.post("/jira-webhook", async (req, res) => {
  const issue = req.body.issue;
  const issueKey = issue.key;
  const issueStatus = issue.fields.status.name;

  const message = `Issue ${issueKey} status updated to ${issueStatus}`;

  // Find the thread for the specific issue
  const thread = await findThreadByIssueKey(issueKey);

  if (thread) {
    // Send message to the specific Discord thread
    thread.send(message);
    res.status(200).send("OK");
  } else {
    res.status(404).send("Thread not found");
  }
});

client.login(DISCORD_TOKEN);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
