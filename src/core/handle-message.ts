import type { DiscordMessage } from "../models/discord.js";
import type Logger from "../models/logger.js";
import type HandleMessageResult from "../models/results/handle-message-result.js";

interface HandleMessageParams {
  readonly message: DiscordMessage;
  readonly deps: {
    readonly logger: Logger;
  };
}
export const handleMessage = ({
  message,
  deps: { logger },
}: HandleMessageParams): HandleMessageResult => {
  logger.info("[handle-message] Handling message:", message);
  if (message.isAuthorBot) {
    logger.info("[handle-message] Message author is a bot. Do not reply.");
    return { tag: "doNotReply" };
  }

  logger.info(
    "[handle-message] Message is from a human. Echo content:",
    message.content,
  );
  return {
    tag: "reply",
    data: message.content,
  };
};
