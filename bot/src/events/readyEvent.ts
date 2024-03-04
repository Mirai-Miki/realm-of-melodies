import type { DiscordEvent } from 'src/types';
import type { Client } from 'src/structures';


import { Events } from 'discord.js';

export = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    console.log(`Connected as: ${client.user?.tag}`);
    await setActivity(client);

    setInterval(() => {
      setActivity(client);
    }, 300000);
  },
} as DiscordEvent;

const { ActivityType } = require('discord.js');

async function setActivity(client: Client) {
  if (!client.user) return;
  client.user.setActivity({
    name: `${client.guilds.cache.size} Servers`,
    type: ActivityType.Watching,
  });
}


