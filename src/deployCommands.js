const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
require("dotenv").config();
const path = require("path");
const configPath = path.join(__dirname, "../config/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const botID = config.botID;
const serverID = config.serverID;
const token = process.env.DISCORD_TOKEN;

const rest = new REST().setToken(token);

const slashRegister = async () => {
  try {
    // Read config.json and get the keys from userMentions
    const fields = Object.keys(config.userMentions);

    // Build the notificar command
    const notificarCommand = new SlashCommandBuilder()
      .setName("notificar")
      .setDescription(
        "Define usuário para receber notificações quando tarefas estiverem em um status específico."
      )
      .addStringOption((option) => {
        option
          .setName("status")
          .setDescription(
            "O status para o qual você deseja definir notificações."
          )
          .setRequired(true);

        // Add choices for each field in config.userMentions
        fields.forEach((field) => {
          option.addChoices({ name: field, value: field });
        });

        return option;
      })
      .addUserOption((option) =>
        option
          .setName("usuario")
          .setDescription("Usuário a ser notificado.")
          .setRequired(false)
      );

    // Build the listarNotificacoes command
    const listarNotificacoesCommand = new SlashCommandBuilder()
      .setName("listar_notificacoes")
      .setDescription(
        "Lista as atuais configurações de notificação para cada status."
      );

    // Build the help command
    const helpCommand = new SlashCommandBuilder()
      .setName("help")
      .setDescription("Lista todos os comandos disponíveis e suas descrições.");

    // Register the slash commands
    await rest.put(Routes.applicationGuildCommands(botID, serverID), {
      body: [
        notificarCommand.toJSON(),
        listarNotificacoesCommand.toJSON(),
        helpCommand.toJSON(),
      ],
    });

    console.log("Successfully registered application commands.");
  } catch (err) {
    console.error(err);
  }
};

slashRegister();
