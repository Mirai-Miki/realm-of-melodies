import type {
  BaseInteraction,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
} from 'discord.js'
import { DiscordAPIError, Events } from 'discord.js'

import type { Client } from 'src/structures'
import type { DiscordEvent, InteractionCommandResponse } from 'src/types'

import { RealmError } from '../errors'

export = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: BaseInteraction) {
    const client = interaction.client as Client

    if (interaction.isChatInputCommand())
      await handleChatInputCommand(client, interaction)
    else if (interaction.isMessageComponent())
      await handleMessageComponent(client, interaction)
  },
} as DiscordEvent

async function handleChatInputCommand(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const command = client.commands.get(interaction.commandName)
  if (!command) return

  let res: InteractionCommandResponse
  try {
    res = await command.execute(interaction)
  } catch (error) {
    if (error instanceof RealmError) {
      res = { message: error.discordResponse, followUps: [] }
    } else {
      res = { message: new RealmError().discordResponse, followUps: [] }
    }
    try {
      await sendResponse(res, interaction)
    } catch {
      // eat error since we want the first error to take priority
    }
    throw error
  }
  try {
    await sendResponse(res, interaction)
  } catch (error) {
    // Eat Unknown interaction error.
    if (error instanceof DiscordAPIError && error.code === 10062) return
    else throw error
  }
}

async function handleMessageComponent(
  client: Client,
  interaction: MessageComponentInteraction
) {
  const match = interaction.customId.match(/^(\w+)_(\w+)/i)
  if (!match) return
  const componentModule = match[0]
  const id = match[1]

  const component = client.components.get(componentModule)
  if (!component) return
  await component.execute(interaction, id)
}

async function sendResponse(
  response: InteractionCommandResponse,
  interaction: ChatInputCommandInteraction
) {
  if (response) {
    if (!interaction.replied && !interaction.deferred)
      await interaction.reply(response.message)
    else await interaction.editReply(response.message)
  } else throw new Error('No discordResponse')

  if (response.followUps) {
    for (const followUp of response.followUps) {
      await interaction.followUp(followUp)
    }
  }
}
