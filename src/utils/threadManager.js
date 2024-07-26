const { ChannelType } = require("discord.js");
const logger = require("./logger");

async function findOrCreateThread(client, channelId, identifier, titulo) {
  try {
    logger.info(`Finding or creating thread for issue: ${identifier}`);

    const channel = await client.channels.fetch(channelId);

    if (channel.type !== ChannelType.GuildText) {
      logger.error(`Channel with ID ${channelId} is not a Text Channel`);
      throw new Error("O canal não é um canal de texto");
    }

    const threads = await channel.threads.fetchActive();

    let thread = threads.threads.find((thread) =>
      thread.name.includes(identifier)
    );

    if (!thread) {
      logger.info(`Creating thread for issue: ${identifier}`);
      thread = await channel.threads.create({
        name: `[${identifier}] ${titulo}`,
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

module.exports = { findOrCreateThread };
