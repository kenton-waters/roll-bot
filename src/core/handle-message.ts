import type Logger from "../models/logger.js";
import type HandleMessageResult from "../models/results/handle-message-result.js";

interface HandleMessageParams {
  readonly message: {
    readonly isAuthorBot: boolean;
    readonly content: string;
  };
  readonly deps: {
    readonly prevLogger: Logger;
  };
}
export const handleMessage = ({
  message,
  deps: { prevLogger },
}: HandleMessageParams): HandleMessageResult => {
  const logger = prevLogger.logWithNew(
    "handle-message",
    "Handling message:",
    message,
  );
  if (message.isAuthorBot) {
    logger.info("Message author is a bot. Do not reply.");
    return { tag: "doNotReply" };
  }

  logger.info("Message is from a human. Echo content:", message.content);
  return {
    tag: "reply",
    data: message.content,
  };
};
