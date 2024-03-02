import type {
  BaseInteraction,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
} from 'discord.js';
import type { DiscordEvent } from 'src/types';
import type { Client } from 'src/structures';

import { Events } from 'discord.js';

export = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: BaseInteraction) {
    const client = interaction.client as Client;

    if (interaction.isChatInputCommand())
      await handleChatInputCommand(client, interaction);
    else if (interaction.isMessageComponent())
      await handleMessageComponent(client, interaction);
  },
} as DiscordEvent;

async function handleChatInputCommand(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const res = await command.execute(interaction);
  if (res) {
    if (!interaction.replied && !interaction.deferred)
      await interaction.reply(res.message);
    else await interaction.editReply(res.message);
  } else throw new Error('No discordResponse');

  if (res.followUps) {
    for (const followUp of res.followUps) {
      await interaction.followUp(followUp);
    }
  }
}

async function handleMessageComponent(
  client: Client,
  interaction: MessageComponentInteraction
) {
  const match = interaction.customId.match(/^(\w+)_(\w+)/i);
  let componentModule: string;
  let id: string;
  if (!match) return;
  componentModule = match[0];
  id = match[1];

  const component = client.components.get(componentModule);
  if (!component) return;
  const res = await component.execute(interaction, id);
}
