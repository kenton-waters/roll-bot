import { Client, GatewayIntentBits } from "discord.js";
import type { DiscordClient } from "../models/discord.js";

const createDiscordClient: () => DiscordClient = () =>
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

export default createDiscordClient;
