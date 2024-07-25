const { Client, GatewayIntentBits, ChannelType } = require("discord.js");
const express = require("express");
const bodyParser = require("body-parser");
const winston = require("winston"); // Para logging
const PORT = process.env.PORT || 3000; // Definir porta padrão para 3000 se PORT não estiver definido

// Configurar o logger Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

// Configuração do bot Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = "1266073955765063716"; // O canal onde os threads serão criados

// Configuração do servidor Express
const app = express();
app.use(bodyParser.json());

// Função para encontrar ou criar um thread
const findOrCreateThread = async (issueKey, issueSummary) => {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    // Verifica se o canal é um canal de texto ou de notícias
    if (
      channel.type !== ChannelType.GuildText &&
      channel.type !== ChannelType.GuildNews
    ) {
      throw new Error("O canal não é um canal de texto");
    }

    // Obtém threads ativas
    const threads = await channel.threads.fetchActive();
    let thread = threads.threads.find((thread) =>
      thread.name.includes(issueKey)
    );

    if (!thread) {
      // Cria um novo thread se não existir
      thread = await channel.threads.create({
        name: `${issueKey} - ${issueSummary}`,
        autoArchiveDuration: 10080, // Arquiva automaticamente após 60 minutos de inatividade
        reason: `Thread para a issue ${issueKey}`,
      });
      logger.info(`Thread criada: ${thread.name}`);
    }

    return thread;
  } catch (error) {
    logger.error(`Erro ao encontrar ou criar thread: ${error.message}`);
    throw error;
  }
};

// Endpoint para receber webhooks do Jira
app.post("/jira-webhook", async (req, res) => {
  try {
    logger.info("Webhook received:", req.body);

    const issue = req.body.issue;
    if (!issue) {
      logger.warn("Sem dados da issue no webhook");
      return res.status(400).send("Bad request: Sem dados da issue");
    }

    const issueKey = issue.key;
    const issueSummary = issue.fields.summary;
    const issueStatus = issue.fields.status.name;

    if (issueStatus === "TO DO") {
      // Não faz nada se o problema estiver em "TO DO"
      return res.status(200).send("OK");
    }

    const message = `Issue ${issueKey} atualizado para o status ${issueStatus}`;

    let thread;

    if (issueStatus === "IN PROGRESS") {
      // Encontrar ou criar um thread
      thread = await findOrCreateThread(issueKey, issueSummary);
    } else if (issueStatus === "DONE") {
      // Encontrar o thread existente
      thread = await findThreadByIssueKey(issueKey);
      if (!thread) {
        logger.warn(`Thread para o problema ${issueKey} não encontrada`);
        return res.status(404).send("Thread não encontrada");
      }
    }

    // Enviar mensagem para o thread específico
    await thread.send(message);
    logger.info(`Mensagem enviada para o thread ${thread.id}: ${message}`);
    res.status(200).send("OK");
  } catch (error) {
    logger.error(`Erro ao processar a requisição do webhook: ${error.message}`);
    res.status(500).send("Erro interno do servidor");
  }
});

client
  .login(DISCORD_TOKEN)
  .then(() => logger.info("Successfully logged in to Discord!"))
  .catch((error) => logger.error(`Error logging to Discord: ${error.message}`));

client.once("ready", () => {
  logger.info(`Logged as ${client.user.tag}!`);
});

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});
