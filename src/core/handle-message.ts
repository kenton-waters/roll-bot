import type { DiscordMessage } from "../models/discord.js";
import type Logger from "../models/logger.js";
import type HandleMessageResult from "../models/results/handle-message-result.js";

interface HandleMessageParams {
  message: DiscordMessage;
  deps: {
    logger: Logger;
  };
}
export const handleMessage = ({
  message,
  deps: { logger },
}: HandleMessageParams): HandleMessageResult => {
  logger.log("[handle-message] Handling message:", message);
  if (message.isAuthorBot) {
    logger.log("[handle-message] Message author is a bot. Do not reply.");
    return { tag: "doNotReply" };
  }

  logger.log(
    "[handle-message] Message is from a human. Echo content:",
    message.content,
  );
  return {
    tag: "reply",
    data: message.content,
  };
};
