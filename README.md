# Discord Jira Bot

Discord Jira Bot is a Discord bot designed to integrate with Jira through webhooks. It provides functionalities to monitor issue updates, send messages when issues are updated, find or create threads, and configure notifications for specific issue statuses. The bot uses Express, discord.js, and winston for logging.

## Features

- **Monitor Issues Updates**: Listens to Jira webhooks to track updates on issues.
- **Send Messages on Issue Updates**: Sends messages to Discord when an issue is updated.
- **Find or Create Thread**: Finds or creates a thread in a specified channel to discuss an issue.
- **Configure Notifications**: Allows configuration of notifications for specific issue statuses.

## Technologies Used

- [Express](https://expressjs.com/)
- [discord.js](https://discord.js.org/)
- [winston](https://github.com/winstonjs/winston)

## Getting Started

### Prerequisites

- Node.js v14 or higher
- Discord Bot Token
- Jira Webhook URL
