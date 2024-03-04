import type { CommandInteraction, VoiceChannel, GuildMember } from 'discord.js';
import type { AudioPlayer } from '@discordjs/voice';
import type { PrismaClient } from '@prisma/client'
import type {
  InteractionCommandResponse,
  InteractionCommandEvent,
} from 'src/types';
import type { Client } from 'src/structures';

import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
} from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';
import getCommandData from './getCommandData';
import { createReadStream } from 'node:fs'

export = {
  data: getCommandData(),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    if (!interaction.guild) throw new Error("Cannot be used in a DM");
    const client = interaction.client as Client;
    const prisma = client.prisma;
    const member = interaction.member as GuildMember;
    let channel;
    if (member.voice.channel) channel = member.voice.channel;
    else throw new Error("needs to be in a channel");

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const subscription = connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, () => loadAndPlay(prisma, player));
    const track = await loadAndPlay(prisma, player);
    if (!track) throw new Error("No track available");

    const embed = new EmbedBuilder();
    embed.setTitle('Playing');
    embed.addFields({name: "Title", value: track.title})
    embed.setColor('#c2992b');

    const res: InteractionCommandResponse = {
      message: { embeds: [embed], ephemeral: true },
      followUps: [],
    };
    return res;
  },
} as InteractionCommandEvent;


async function loadAndPlay(prisma: PrismaClient, player: AudioPlayer) {
  const tracks = await prisma.track.findMany();
  if (!tracks) return;
  let track;
  if (tracks.length > 0) {
    const randomIndex = Math.floor(Math.random() * tracks.length);
    track = tracks[randomIndex];
  } else {
    console.log("No tracks found in the database");
    return;
  }

  const path = process.cwd() + track.filePath;

  const audioTrack = createAudioResource(createReadStream(path), {inputType: StreamType.OggOpus});
  player.play(audioTrack);
  console.log("Playing:", track.title);
  return track;
}
