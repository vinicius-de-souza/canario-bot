const fs = require("fs");
const configPath = "../../config/config.json";

function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function writeConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
}
