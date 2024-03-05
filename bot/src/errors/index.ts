import type { TextChannel } from 'discord.js'
import { EmbedBuilder } from 'discord.js'

import type { Client } from 'src/structures'

import { RealmError, ErrorCodes } from './RealmError'

export { RealmError, ErrorCodes }

export async function handleErrorDebug(
  error: Error | RealmError,
  client: Client
) {
  if (error instanceof RealmError && error.debug.raise === false) return
  if (process.env.DEV === 'true') {
    // Print to console on dev enviorment
    console.error(error)
    return
  }

  try {
    const debugEmbed = new EmbedBuilder()
      .setTitle(error.name)
      .setColor('#db0f20')

    let description = ''
    if (error instanceof RealmError && error.debug.cause)
      description += `\n\nCaused by:\n${error.cause}`
    debugEmbed.setDescription(error.stack + description)

    if (client.shard) {
      client.shard.broadcastEval(
        async (c, { message }) => {
          const channel = c.channels.cache.get(
            '1213452544601362443'
          ) as TextChannel
          if (channel) {
            await channel.send(message)
            return true
          }
          return false
        },
        { context: { message: { embeds: [debugEmbed] } } }
      )
    } else {
      const channel = client.channels.cache.get(
        '1213452544601362443'
      ) as TextChannel
      channel.send({ embeds: [debugEmbed] })
    }
  } catch (e) {
    console.error(error)
    console.error('\nPrinting to console because of Error:')
    console.error(e)
  }
}
