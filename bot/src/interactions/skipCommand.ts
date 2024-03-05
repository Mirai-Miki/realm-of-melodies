import { getVoiceConnection, VoiceConnectionStatus } from '@discordjs/voice'
import type { CommandInteraction } from 'discord.js'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'

import type {
  InteractionCommandResponse,
  InteractionCommandEvent,
} from 'src/types'

export = {
  data: getCommandData(),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply()
    if (!interaction.guild) throw new Error('Cannot be used in a DM')

    const connection = getVoiceConnection(interaction.guild.id)
    let audioPlayer

    switch (connection?.state.status) {
      case VoiceConnectionStatus.Signalling:
      case VoiceConnectionStatus.Connecting:
      case VoiceConnectionStatus.Ready:
        audioPlayer = connection?.state.subscription?.player
        if (audioPlayer) {
          audioPlayer.stop()
        }
        break
    }
    const embed = new EmbedBuilder()
    embed.setTitle('Skipped to next song')
    embed.setColor('#c2992b')

    const res: InteractionCommandResponse = {
      message: { embeds: [embed], ephemeral: true },
      followUps: [],
    }
    return res
  },
} as InteractionCommandEvent

function getCommandData() {
  const command = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Stops playing music.')
    .setDMPermission(false)
  return command as SlashCommandBuilder
}
