import type { DiscordMessage } from "../models/discord.js";
import type Logger from "../models/logger.js";
import type HandleMessageResult from "../models/results/handle-message-result.js";

export const handleMessage = (
  logger: Logger,
  message: DiscordMessage,
): HandleMessageResult => {
  if (message.isAuthorBot) {
    return { tag: "doNotReply" };
  }

  logger.log(`[login] Handling message: ${JSON.stringify(message)}`);
  return {
    tag: "reply",
    data: message.content,
  };
};
