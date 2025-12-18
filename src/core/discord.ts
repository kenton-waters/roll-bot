import { Events } from "discord.js";
import type Logger from "../models/logger.js";
import type { DiscordClient } from "../models/discord.js";
import { handleMessage } from "./handle-message.js";

interface StartBotParams {
  discordClient: DiscordClient;
  discordToken: string;
  deps: {
    handleMessage: typeof handleMessage;
    logger: Logger;
  };
}
export const startBot = async ({
  discordClient,
  discordToken,
  deps: { handleMessage, logger },
}: StartBotParams): Promise<void> => {
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
          authorTag: message.author.tag,
          authorId: message.author.id,
          messageContent: message.content,
        },
        null,
        2, // space: number of spaces for pretty-printing indents
      )}`,
    );

    const result = handleMessage({
      message: {
        isAuthorBot: message.author.bot,
        content: message.content,
      },
      deps: { logger: logger },
    });

    if (result.tag === "doNotReply") {
      logger.log("[discord] Not replying to message");
      return;
    }

    logger.log(`[discord] Replying with: ${result.data}`);
    void message.reply(result.data);
  });

  await discordClient.login(discordToken);
};
