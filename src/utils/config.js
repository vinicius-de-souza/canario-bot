const fs = require("fs");
const configPath = "../../config/config.json";

function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function writeConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
}

function getConfig() {
  delete require.cache[require.resolve(configPath)];
  return require(configPath);
}

module.exports = { readConfig, writeConfig, getConfig };
