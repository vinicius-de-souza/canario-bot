const client = require("../bot");
const logger = require("../utils/logger");
const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { getConfig } = require("../utils/config");

async function findOrCreateThread(identifier, summary) {
  try {
    logger.info(`Finding or creating thread for issue: ${identifier}`);

    const channel = await client.channels.fetch(config.channelId);
    const threads = await channel.threads.fetchActive();

    let thread = threads.threads.find((thread) =>
      thread.name.includes(identifier)
    );

    if (!thread) {
      logger.info(`Creating thread for issue: ${identifier}`);
      thread = await channel.threads.create({
        name: `[${identifier}] ${summary}`,
        autoArchiveDuration: 4320,
        reason: `Thread para a issue ${identifier}`,
      });
      logger.info(`Thread created: ${thread.id} - ${thread.name}`);
    } else {
      logger.info(
        `Existing thread found for issue: ${identifier} - ${thread.id}`
      );
    }

    return thread;
  } catch (error) {
    logger.error(`Error finding or creating thread: ${error.message}`);
    throw error;
  }
}

async function createUpdateIssueEmbed(issueStatus, issueIdentifier) {
  const embed = new EmbedBuilder()
    .setURL(config.atlassianProjectUrl + "/browse/" + issueIdentifier)
    .setColor("#42c790")
    .setTitle(`${issueIdentifier}`)
    .setDescription(`Tarefa está disponível para **${issueStatus}**`)
    .setTimestamp()
    .setFooter({
      text: "Mais Laudo",
      iconURL: `https://i.imgur.com/1Mgq8bU.png`,
    });
  return embed;
}

async function getUserMentionForStatus(issueStatus) {
  const config = getConfig();
  const userMentions = Object.entries(config.userMentions).filter(
    ([status, userId]) => userId
  );

  const mentions = userMentions
    .filter(([status]) => status === issueStatus)
    .map(([, userId]) => `<@${userId}>`)
    .join(" ");

  return mentions || null;
}

module.exports = {
  findOrCreateThread,
  createUpdateIssueEmbed,
  getUserMentionForStatus,
};
