import { Events } from "discord.js";
import type Logger from "../models/logger.js";
import type { DiscordClient } from "../models/discord.js";
import { handleMessage } from "./handle-message.js";

export const startBot = (
  logger: Logger,
  discordClient: DiscordClient,
  discordToken: string,
) => {
  discordClient.once(Events.ClientReady, (readyClient) => {
    logger.log(
      `[discord] roll-bot is ready! Logged in as ${readyClient.user.tag}`,
    );
  });

  discordClient.on(Events.MessageCreate, (message) => {
    const result = handleMessage(logger, {
      authorIsBot: message.author.bot,
      content: message.content,
    });
    if (result.tag === "reply") {
      void message.reply(result.data);
    }
  });

  return discordClient.login(discordToken);
};
