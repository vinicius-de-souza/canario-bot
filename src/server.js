const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./utils/logger");
const client = require("./bot");
const { findOrCreateThread } = require("./utils/threadManager");
const config = require("../config/config.json");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/jira-webhook", async (req, res) => {
  try {
    const { issue_event_type_name, issue } = req.body;

    if (!issue) {
      logger.warn("Sem dados de problema no webhook");
      return res.status(400).send("Requisição ruim: Sem dados de problema");
    }

    if (issue_event_type_name !== "issue_generic") {
      logger.warn("Sem tratamento para este tipo de webhook");
      return res.status(200).send("OK");
    }

    const issueKey = issue.key;
    const issueSummary = issue.fields.summary;
    const issueStatus = issue.fields.status.name;

    logger.info(
      `Recebido webhook: ${issueKey} - ${issueSummary} - ${issueStatus}`
    );

    if (issueStatus === config.status[0]) {
      return res.status(200).send("OK");
    }

    const thread = await findOrCreateThread(
      client,
      config.channelId,
      issueKey,
      issueSummary
    );

    if (thread) {
      if (issueStatus === config.status[1]) {
        await thread.send(
          `${issueKey} foi atualizada para ${config.status[1]}`
        );
        res.status(200).send("OK");
      } else if (issueStatus === config.status[2]) {
        await thread.send(
          `${issueKey} foi atualizada para ${config.status[2]}`
        );
        res.status(200).send("OK");
      }
    } else {
      logger.error(`Thread é indefinida para a issue ${issueKey}`);
      res.status(500).send("Internal server error");
    }
  } catch (error) {
    logger.error(`Erro ao processar a requisição do webhook: ${error.message}`);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  logger.info(`Server listening @ 3000`);
});
