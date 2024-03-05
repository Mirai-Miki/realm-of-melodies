import type { CommandInteraction } from 'discord.js'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'

import type {
  InteractionCommandResponse,
  InteractionCommandEvent,
} from 'src/types'

export = {
  data: getCommandData(),
  async execute(interaction: CommandInteraction) {
    const client = interaction.client
    const inviteLink =
      'https://discord.com/oauth2/authorize?client_id=1213453980668133477&scope=bot&permissions=412320319552'
    const createdTimestamp = String(client.user.createdTimestamp).slice(0, 10)

    const embed = new EmbedBuilder()
    embed.setTitle('Click to invite me to your Server!')
    embed.setURL(inviteLink)
    embed.setThumbnail(client.user.displayAvatarURL())
    embed.setDescription(
      `Servers: ${client.guilds.cache.size}\nCreated on: <t:${createdTimestamp}:D> - <t:${createdTimestamp}:R>`
    )
    embed.setColor('#E09A5C')

    const res: InteractionCommandResponse = {
      message: { embeds: [embed], ephemeral: true },
      followUps: [],
    }
    return res
  },
} as InteractionCommandEvent

function getCommandData() {
  const command = new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Gets an Invite link for the bot.')
  return command as SlashCommandBuilder
}
