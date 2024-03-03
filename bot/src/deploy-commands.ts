const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const dev = process.env.DEV;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = '1213452175527911424';
const token = process.env.DISCORD_BOT_TOKEN;

const commands: any[] = [];
// Grab all the command folders from the Interactions directory you created earlier
const foldersPath = path.join(__dirname, 'Interactions');

function setInteractions(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);
    if (fileStat.isDirectory()) {
      setInteractions(filePath);
    } else if (file.match(/Command\.js|ts$/)) {
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
}

setInteractions(foldersPath);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    let data;
    if (dev === 'true') {
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
    } else {
      data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
    }

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
