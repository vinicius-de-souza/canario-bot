const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const configPath = path.join(__dirname, "../../config/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const handleNotificarCommand = async (interaction) => {
  const status = interaction.options.getString("status");
  const user = interaction.options.getUser("usuario");
  let description = "";

  // Update or add the user ID as a string in the specified field
  if (user) {
    config.userMentions[status] = user.id;
    description = `<@${user.id}> agora irá receber notificações quando tarefas estiverem em **${status}**.`;
  } else {
    config.userMentions[status] = "";
    description = `Notiticacões removidas para tarefas em **${status}**.`;
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

  const embed = new EmbedBuilder()
    .setColor("#42c790")
    .setTitle("Nova Configuração de Notificação")
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      text: "Mais Laudo",
      iconURL: "https://i.imgur.com/1Mgq8bU.png",
    });

  await interaction.reply({
    embeds: [embed],
  });
};

const handleListarNotificacoesCommand = async (interaction, client) => {
  let description = "";
  for (const [field, userId] of Object.entries(config.userMentions)) {
    if (userId) {
      try {
        const user = await client.users.fetch(userId);
        description += `**${field}**: ${user.username}\n`;
      } catch (err) {
        description += `**${field}**: Usuário não encontrado (ID: ${userId})\n`;
      }
    } else {
      description += `**${field}**: Não definido\n`;
    }
  }

  const embed = new EmbedBuilder()
    .setColor("#42c790")
    .setTitle("Configuração de Notificação Atual")
    .setDescription(
      description || "Nenhuma configuração de notificação definida."
    )
    .setTimestamp()
    .setFooter({
      text: "Mais Laudo",
      iconURL: "https://i.imgur.com/1Mgq8bU.png",
    });

  await interaction.reply({
    embeds: [embed],
  });
};

const handleHelpCommand = async (interaction) => {
  const embed = new EmbedBuilder()
    .setColor("#42c790")
    .setTitle("Lista de Comandos")
    .setDescription(
      `
    **/notificar [status] [usuário] **: Define usuário para receber notificações quando tarefas estiverem em um status específico. Caso o campo usuário esteja em branco, as notificações para o status serão removidas.

    **/listar_notificacoes**: Lista as atuais configurações de notificação para cada status.
    
    **/help**: Lista todos os comandos disponíveis e suas descrições.
    
    `
    )
    .setTimestamp()
    .setFooter({
      text: "Mais Laudo",
      iconURL: "https://i.imgur.com/1Mgq8bU.png",
    });

  await interaction.reply({
    embeds: [embed],
  });
};

module.exports = {
  handleNotificarCommand,
  handleListarNotificacoesCommand,
  handleHelpCommand,
};
