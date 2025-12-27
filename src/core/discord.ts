import { Client, Events } from "discord.js";
import type Logger from "../models/logger.js";
import handleMessage from "./handle-message.js";

interface StartBotParams {
  readonly discordClient: Client;
  readonly discordToken: string;
  readonly deps: {
    readonly handleMessage: typeof handleMessage;
    readonly prevLogger: Logger;
  };
}
export const startBot = async ({
  discordClient,
  discordToken,
  deps: { handleMessage, prevLogger },
}: StartBotParams): Promise<void> => {
  const startBotLogger = prevLogger.logWithNew(
    "discord",
    "Executing startBot...",
  );

  discordClient.once(Events.ClientReady, (readyClient) => {
    startBotLogger.info(
      "roll-bot is ready! Logged in as",
      readyClient.user.tag,
    );
  });

  discordClient.on(Events.MessageCreate, (message) => {
    const messageLogger = startBotLogger.logWithNew(
      `message ${message.id}`,
      "Message created:",
      {
        channelName:
          "name" in message.channel ? message.channel.name : undefined,
        channelId: message.channelId,
        authorTag: message.author.tag,
        authorId: message.author.id,
        messageContent: message.content,
      },
    );

    const result = handleMessage({
      rollBotUserId: discordClient.user?.id,
      message: {
        authorUserId: message.author.id,
        content: message.content,
      },
      deps: { prevLogger: messageLogger },
    });

    if (result.tag === "doNotReply") {
      messageLogger.info("Not replying to message.");
      return;
    }

    messageLogger.info("Replying with:", result.data);
    void message.reply(result.data);
  });

  startBotLogger.info("Logging in...");
  await discordClient.login(discordToken);
};
