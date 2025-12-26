import { Client, GatewayIntentBits } from "discord.js";

const createDiscordClient: () => Client = () =>
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

export default createDiscordClient;
