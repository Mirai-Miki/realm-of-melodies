import { PrismaClient } from '@prisma/client'
import { Client as DiscordClient } from 'discord.js'
import { ClientOptions, Collection, InteractionReplyOptions } from 'discord.js'

import type {
  InteractionCommandEvent,
  InteractionComponentEvent,
} from '../types/types'

export class Client extends DiscordClient {
  public commands: Collection<string, InteractionCommandEvent>
  public components: Collection<string, InteractionComponentEvent>
  public prisma: PrismaClient
  private _followUps: InteractionReplyOptions[]

  constructor(options: ClientOptions) {
    super(options)
    this.commands = new Collection()
    this.components = new Collection()
    this.prisma = new PrismaClient()
    this._followUps = []
  }

  get followUps(): InteractionReplyOptions[] {
    return this._followUps
  }

  addFollowUp(message: InteractionReplyOptions) {
    this._followUps.push(message)
  }
}
