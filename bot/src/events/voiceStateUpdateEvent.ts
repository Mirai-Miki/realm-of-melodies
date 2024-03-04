import type { DiscordEvent } from 'src/types';
import type { VoiceState } from 'discord.js';

import { Events } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

export = {
  name: Events.VoiceStateUpdate,
  once: false,
  async execute(oldState: VoiceState, newState: VoiceState) {
    const connection = getVoiceConnection(newState.guild.id);
    if (!connection) return;
    if (oldState.channel?.members.size === 1 && oldState.channel.members.has(newState.client.user.id)) {
      connection.destroy();
    }
  },
} as DiscordEvent;


