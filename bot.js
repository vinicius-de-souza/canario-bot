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
        autoArchiveDuration: 4320, // Arquiva automaticamente após 3 dias de inatividade
        reason: `Thread para o problema ${issueKey}`,
      });
      logger.info(`Thread criada: ${thread.id}`);
    } else {
      logger.info(`Thread existente encontrada: ${thread.id}`);
    }

    return thread;
  } catch (error) {
    logger.error(`Erro ao encontrar ou criar thread: ${error.message}`);
    throw error;
  }
};

// Função para encontrar um thread pelo issueKey
const findThreadByIssueKey = async (issueKey) => {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (
      channel.type !== ChannelType.GuildText &&
      channel.type !== ChannelType.GuildNews
    ) {
      throw new Error("O canal não é um canal de texto");
    }

    // Obtém threads ativas
    const threads = await channel.threads.fetchActive();
    const thread = threads.threads.find((thread) =>
      thread.name.includes(issueKey)
    );

    if (!thread) {
      logger.info(`Nenhum thread encontrado para o issueKey ${issueKey}`);
    } else {
      logger.info(`Thread encontrada: ${thread.id}`);
    }

    return thread;
  } catch (error) {
    logger.error(`Erro ao encontrar thread: ${error.message}`);
    throw error;
  }
};

// Endpoint para receber webhooks do Jira
app.post("/jira-webhook", async (req, res) => {
  try {
    logger.info("Recebido webhook:", req.body);

    const issue = req.body.issue;
    if (!issue) {
      logger.warn("Sem dados de problema no webhook");
      return res.status(400).send("Requisição ruim: Sem dados de problema");
    }

    const issueKey = issue.key;
    const issueSummary = issue.fields.summary;
    const issueStatus = issue.fields.status.name;

    if (issueStatus === "TO DO") {
      return res.status(200).send("OK");
    }

    const message = `Problema ${issueKey} atualizado para o status ${issueStatus}`;

    let thread;

    if (issueStatus === "IN PROGRESS") {
      thread = await findOrCreateThread(issueKey, issueSummary);
    } else if (issueStatus === "DONE") {
      thread = await findThreadByIssueKey(issueKey);
      if (!thread) {
        logger.warn(`Thread para o problema ${issueKey} não encontrada`);
        return res.status(404).send("Thread não encontrada");
      }
    }

    // Verifica se o thread existe antes de tentar enviar a mensagem
    if (thread) {
      await thread.send(message);
      logger.info(`Mensagem enviada para o thread ${thread.id}: ${message}`);
      res.status(200).send("OK");
    } else {
      logger.error(`Thread é indefinida para o problema ${issueKey}`);
      res.status(500).send("Erro interno do servidor");
    }
  } catch (error) {
    logger.error(`Erro ao processar a requisição do webhook: ${error.message}`);
    res.status(500).send("Erro interno do servidor");
  }
});

client
  .login(DISCORD_TOKEN)
  .then(() => logger.info("Bot do Discord logado com sucesso"))
  .catch((error) => logger.error(`Erro ao logar no Discord: ${error.message}`));

client.once("ready", () => {
  logger.info(`Logado como ${client.user.tag}!`);
});

app.listen(PORT, () => {
  logger.info(`Servidor ouvindo na porta ${PORT}`);
});
