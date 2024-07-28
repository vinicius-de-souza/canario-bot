const {
  findOrCreateThread,
  createUpdateIssueEmbed,
  getUserMentionForStatus,
} = require("../services/discordService");
const logger = require("../utils/logger");

async function handleIssueUpdate(issue) {
  const issueKey = issue.key;
  const issueSummary = issue.fields.summary;
  const issueStatus = issue.fields.status.name;

  // If the issue is in a status that we want to notify, continue
  if (issueStatus === "ITENS PENDENTES" || issueStatus === "EM ANDAMENTO") {
    logger.info(
      `Issue ${issueKey} is not in a status to notify (${issueStatus})`
    );
    return;
  }

  logger.info(
    `Issue ${issueKey} is in a status to notify (${issueStatus}) \nStarting notification process...`
  );

  // Check if the thread exists or create a new one
  const thread = await findOrCreateThread(issueKey, issueSummary);

  const message = await createUpdateIssueEmbed(issueStatus, issueKey);

  const userMention = await getUserMentionForStatus(issueStatus);

  if (thread) {
    await thread.send({ embeds: [message] });
    userMention ? await thread.send(userMention) : null;
  } else {
    throw new Error("Thread is undefined");
  }
}

module.exports = { handleIssueUpdate };
