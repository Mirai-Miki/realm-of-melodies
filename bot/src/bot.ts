import { join } from 'path'

import { GatewayIntentBits, Partials, Collection } from 'discord.js'

import type {
  InteractionCommandEvent,
  InteractionComponentEvent,
  DiscordEvent,
} from 'src/types'

import { RealmError, handleErrorDebug } from './errors'
import { Client } from './structures'

const token = process.env.DISCORD_BOT_TOKEN
const fs = require('fs')

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  partials: [Partials.GuildMember, Partials.User],
})

client.commands = new Collection<string, InteractionCommandEvent>()
client.components = new Collection<string, InteractionComponentEvent>()

function setInteractions(dir: string) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = join(dir, file)
    const fileStat = fs.statSync(filePath)

    if (fileStat.isDirectory()) {
      setInteractions(filePath)
    } else if (file.match(/Command\.js|ts$/)) {
      const command = require(filePath)
      client.commands.set(command.data.name, command)
    } else if (file.match(/Component\.js|ts$/)) {
      const component = require(filePath)
      client.components.set(component.name, component)
    }
  }
}

setInteractions(join(__dirname, 'interactions'))

/* Event Listeners */
const path = join(__dirname, 'events')
const eventFiles = fs.readdirSync(path)
for (const file of eventFiles) {
  if (!file.match(/Event\.(js|ts)$/)) continue
  const event: DiscordEvent = require(`${path}/${file}`)

  const eventHandler = async (...args: any) => {
    try {
      await event.execute(...args)
    } catch (error) {
      if (error instanceof Error) handleErrorDebug(error, client)
    }
  }

  if (event.once) {
    client.once(event.name, eventHandler)
  } else {
    client.on(event.name, eventHandler)
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'Reason:', reason)
  const error = new RealmError({
    cause: `Unhandled Rejection at: ${promise}\nReason: ${reason}`,
  })
  handleErrorDebug(error, client)
})

// Logs into the server using the secret token
client.login(token)
