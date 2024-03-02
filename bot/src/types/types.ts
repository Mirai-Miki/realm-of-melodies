import type {
  CommandInteraction,
  InteractionReplyOptions,
  MessageComponentInteraction,
  SlashCommandBuilder,
  BaseMessageOptions,
} from 'discord.js';

export interface DiscordEvent {
  name: string;
  once: boolean;
  execute(...args: any[]): Promise<void>;
}

export interface InteractionCommandEvent {
  data: SlashCommandBuilder;
  execute(interaction: CommandInteraction): Promise<InteractionCommandResponse>;
}

export interface InteractionComponentEvent {
  execute(
    interaction: MessageComponentInteraction,
    id: string
  ): Promise<InteractionComponentResponse>;
}

export interface InteractionCommandResponse {
  message: InteractionReplyOptions;
  followUps: BaseMessageOptions[];
}

export interface InteractionComponentResponse {
  edit: InteractionReplyOptions | null;
  reply: InteractionReplyOptions | null;
  followUps: BaseMessageOptions[];
}
