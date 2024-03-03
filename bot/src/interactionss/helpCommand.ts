import type {
  InteractionCommandResponse,
  InteractionCommandEvent,
} from 'src/types';

import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export = {
  data: getCommandData(),
  async execute() {
    const inviteLink = 'placeholder';

    const embed = new EmbedBuilder();
    embed.setTitle('Click to go to my help site!');
    embed.setURL(inviteLink);
    embed.setDescription(
      `My help site shows all of my commands as well as instructions on how to use them.\nYou can also see a list of commands you can use in this channel by just pressing / in the chat window.`
    );
    embed.setColor('#E09A5C');

    const res: InteractionCommandResponse = {
      message: { embeds: [embed], ephemeral: true },
      followUps: [],
    };
    return res;
  },
} as InteractionCommandEvent;

function getCommandData() {
  const command = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Gets an help site link for the bot.');

  return command as SlashCommandBuilder;
}
