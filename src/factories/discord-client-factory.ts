import { Client, GatewayIntentBits } from "discord.js";
import type DiscordClient from "../models/discord-client.js";

const getDiscordClient: () => DiscordClient = () =>
  new Client({
    intents: [GatewayIntentBits.Guilds],
  });

export default getDiscordClient;
