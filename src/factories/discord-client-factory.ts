import { Client, GatewayIntentBits } from "discord.js";
import type { DiscordClient } from "../models/discord.js";

const getDiscordClient: () => DiscordClient = () =>
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

export default getDiscordClient;
