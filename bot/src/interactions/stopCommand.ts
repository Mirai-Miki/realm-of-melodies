import type { CommandInteraction } from 'discord.js';
import type {
  InteractionCommandResponse,
  InteractionCommandEvent,
} from 'src/types';

import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';

export = {
  data: getCommandData(),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    if (!interaction.guild) throw new Error("Cannot be used in a DM");

    const connection = getVoiceConnection(interaction.guild.id);
    connection?.destroy();
    const embed = new EmbedBuilder();
    embed.setTitle('Stopped playing');
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
    .setName('stop')
    .setDescription('Stops playing music.');
  return command as SlashCommandBuilder;
}
