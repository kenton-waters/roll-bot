import { Client, Events } from "discord.js";
import type Logger from "../models/logger.js";
import handleMessage from "./handle-message.js";
import tokenize from "./lexing-parsing/tokenize.js";
import parse from "./lexing-parsing/parse.js";
import { evaluate } from "../util/tree-helpers.js";

interface StartBotParams {
  readonly discordClient: Client;
  readonly discordToken: string;
  readonly deps: {
    readonly prevLogger: Logger;
  };
}
export const startBot = async ({
  discordClient,
  discordToken,
  deps: { prevLogger },
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
    const channelName =
      "name" in message.channel ? message.channel.name : undefined;
    const messageLogger = startBotLogger.logWithNew(
      `message ${message.id}`,
      "Message created:",
      {
        channelName: channelName,
        channelId: message.channelId,
        authorTag: message.author.tag,
        authorId: message.author.id,
        messageContent: message.content,
      },
    );

    const result = handleMessage({
      rollsChannelName: undefined,
      rollBotUserId: discordClient.user?.id,
      message: {
        authorUserId: message.author.id,
        channelName: channelName,
        content: message.content,
      },
      deps: { tokenize, parse, evaluate, prevLogger: messageLogger },
    });

    if (result.type === "doNotReply") {
      messageLogger.info("Not replying to message.");
      return;
    }

    messageLogger.info("Replying with:", result.string);
    void message.reply(result.string);
  });

  startBotLogger.info("Logging in...");
  await discordClient.login(discordToken);
};
