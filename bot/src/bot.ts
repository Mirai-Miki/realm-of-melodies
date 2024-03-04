import type { TextChannel } from 'discord.js';
import type {
  InteractionCommandEvent,
  InteractionComponentEvent,
  DiscordEvent,
} from 'src/types';

import { GatewayIntentBits, Partials, Collection } from 'discord.js';
import { Client } from './structures';
import { join } from 'path';

const token = process.env.DISCORD_BOT_TOKEN;
const dev = process.env.DEV;
const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  partials: [Partials.GuildMember, Partials.User],
});

client.commands = new Collection<string, InteractionCommandEvent>();
client.components = new Collection<string, InteractionComponentEvent>();

function setInteractions(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      setInteractions(filePath);
    } else if (file.match(/Command\.js|ts$/)) {
      const command = require(filePath);
      client.commands.set(command.data.name, command);
    } else if (file.match(/Component\.js|ts$/)) {
      const component = require(filePath);
      client.components.set(component.name, component);
    }
  }
}

setInteractions(join(__dirname, 'interactions'));

/* Event Listeners */
const path = join(__dirname, 'events');
const eventFiles = fs.readdirSync(path);
for (const file of eventFiles) {
  if (!file.match(/Event\.(js|ts)$/)) continue;
  const event: DiscordEvent = require(`${path}/${file}`);
  if (event.once) {
    client.once(event.name, async (...args: any) => {
      try {
        await event.execute(...args);
      } catch (error) {
        const err = error as Error;
        await handleError(client, err);
      }
    });
  } else {
    client.on(event.name, async (...args: any) => {
      try {
        await event.execute(...args);
      } catch (error) {
        const err = error as Error;
        await handleError(client, err);
      }
    });
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
  // Handle the error or log it as needed
});

async function handleError(client: Client, err: Error) {
  // Send the error to a Discord debug channel or logging service
  const debugChannel = client.channels.cache.get(
    '1213452544601362443'
  ) as TextChannel;
  if (debugChannel && !dev) {
    try {
      await debugChannel.send(`An error occurred: \`\`\`${err.message}\n\n${err.stack}\`\`\``);
    } catch {
      console.error(err);
    }
  } else console.error(err);
}

// Logs into the server using the secret token
client.login(token);
