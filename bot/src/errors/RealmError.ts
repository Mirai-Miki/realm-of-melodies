import type { InteractionReplyOptions } from 'discord.js'
import { EmbedBuilder } from 'discord.js'

export enum ErrorCodes {
  RealmError,
  UserNotInVoice,
}

interface ErrorConstructor {
  cause?: string
  code?: ErrorCodes
}

export class RealmError extends Error {
  public code: number
  public discordResponse: InteractionReplyOptions
  public debug: { raise: boolean; cause: boolean }
  public cause: string

  constructor(
    { cause = '', code = ErrorCodes.RealmError }: ErrorConstructor = {
      cause: '',
      code: ErrorCodes.RealmError,
    }
  ) {
    super(ErrorRecord[code].system)
    this.name = 'RealmError'
    this.discordResponse = {
      embeds: [getErrorEmbed(code)],
      ephemeral: true,
      content: '',
      components: [],
    }
    this.debug = {
      raise: ErrorRecord[code].debug,
      cause: ErrorRecord[code].cause,
    }
    this.cause = cause
    this.code = code
  }
}

function getErrorEmbed(code: ErrorCodes) {
  const embed = new EmbedBuilder()
    .setColor('#db0f20')
    .setThumbnail(
      'https://cdn.discordapp.com/attachments/817275006311989268/974198094696689744/error.png'
    )

  embed.setTitle(ErrorRecord[code].embedTitle)
  let description = ErrorRecord[code].embedMessage
  description += '\n[RoM Support Server](https://discord.gg/HR4vk6khHH)'
  embed.setDescription(description)
  return embed
}

// Interface for error information structure
interface ErrorInfo {
  system: string
  embedTitle: string
  embedMessage: string
  debug: boolean
  cause: boolean
}

const ErrorRecord: Record<ErrorCodes, Readonly<ErrorInfo>> = {
  [ErrorCodes.RealmError]: {
    system: 'The Bot encountered an Error',
    embedTitle: 'Bot Error',
    embedMessage: `Oops! Looks like you broke the bot.\nIf you see this please let us know in the support server so we can fix it!`,
    debug: true,
    cause: true,
  },
  [ErrorCodes.UserNotInVoice]: {
    system: 'User not in a voice channel while starting',
    embedTitle: 'Not in a Voice Channel',
    embedMessage: `Sorry, you must be in a voice channel to start playing.\nPlease join a voice channel and try again!`,
    debug: false,
    cause: false,
  },
} as const
