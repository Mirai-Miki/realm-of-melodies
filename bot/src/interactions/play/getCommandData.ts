import { SlashCommandBuilder } from 'discord.js';

export = function getCommandData() {
  const command = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays music in the channel you are in.');
  return command as SlashCommandBuilder;
}
