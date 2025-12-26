import type Logger from "../models/logger.js";
import type HandleMessageResult from "../models/results/handle-message-result.js";

interface HandleMessageParams {
  readonly rollBotUserId: string | undefined;
  readonly message: {
    readonly authorUserId: string;
    readonly content: string;
  };
  readonly deps: {
    readonly prevLogger: Logger;
  };
}
export const handleMessage = ({
  rollBotUserId,
  message,
  deps: { prevLogger },
}: HandleMessageParams): HandleMessageResult => {
  const logger = prevLogger.logWithNew(
    "handle-message",
    "Handling message:",
    message,
    "with roll-bot user id:",
    rollBotUserId,
  );

  if (rollBotUserId === undefined) {
    logger.error("rollBotUserId is undefined. Do not reply.");
    return { tag: "doNotReply" };
  }

  logger.info("Checking whether message was sent by roll-bot...");
  if (rollBotUserId === message.authorUserId) {
    logger.info("Message is from roll-bot. Do not reply.");
    return { tag: "doNotReply" };
  }

  logger.info("Message is not from roll-bot. Echo content:", message.content);
  return {
    tag: "reply",
    data: message.content,
  };
};
