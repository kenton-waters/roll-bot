import { Events } from "discord.js";
import type Logger from "../models/logger.js";
import type { DiscordClient } from "../models/discord.js";
import { handleMessage } from "./handle-message.js";

export const startBot = (
  logger: Logger,
  discordClient: DiscordClient,
  discordToken: string,
) => {
  logger.log("[discord] Executing startBot...");

  discordClient.once(Events.ClientReady, (readyClient) => {
    logger.log(
      `[discord] roll-bot is ready! Logged in as ${readyClient.user.tag}`,
    );
  });

  discordClient.on(Events.MessageCreate, (message) => {
    logger.log(
      `[discord] Message created: ${JSON.stringify(
        {
          channelName:
            "name" in message.channel ? message.channel.name : undefined,
          channelId: message.channelId,
          authorGlobalName: message.author.globalName,
          authorTag: message.author.tag,
          authorId: message.author.id,
          messageContent: message.content,
        },
        null,
        2, // space: number of spaces for pretty-printing indents
      )}`,
    );

    const result = handleMessage(logger, {
      isAuthorBot: message.author.bot,
      content: message.content,
    });

    if (result.tag === "doNotReply") {
      logger.log("[discord] Not replying to message");
      return;
    }

    logger.log(`[discord] Replying with: ${result.data}`);
    void message.reply(result.data);
  });

  return discordClient.login(discordToken);
};
