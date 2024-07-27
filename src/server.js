const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./utils/logger");
const { handleIssueUpdate } = require("./events/issueHandler");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/jira-webhook", async (req, res) => {
  try {
    const { issue_event_type_name, issue } = req.body;

    // If there's no issue data in the webhook, return a 400
    if (!issue) {
      logger.warn("No issue data in the webhook");
      return res.status(400).send("Bad request: No issue data");
    }

    // Handle issue updates
    if (issue_event_type_name == "issue_generic") {
      await handleIssueUpdate(issue);
      return res.status(200).send("OK");
    }

    // If there is no handler for the webhook type, return a 404
    logger.warn("No handler for this type of webhook");
    return res.status(404).send("NOT FOUND");
  } catch (error) {
    logger.error(`Error processing webhook request: ${error.message}`);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  logger.info(`Server listening @ 3000`);
});
