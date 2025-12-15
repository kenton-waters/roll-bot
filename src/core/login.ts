import { Events } from "discord.js";
import type Logger from "../models/logger.js";
import type DiscordClient from "../models/discord-client.js";

export const loginAsDiscordBot = (
  logger: Logger,
  discordClient: DiscordClient,
  discordToken: string,
) => {
  // When the client is ready, run this code (only once).
  // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
  // It makes some properties non-nullable.
  discordClient.once(Events.ClientReady, (readyClient) => {
    logger.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  // Log in to Discord with your client's token
  return discordClient.login(discordToken);
};
