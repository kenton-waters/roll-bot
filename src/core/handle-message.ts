import type Logger from "../models/logger.js";
import type HandleMessageResult from "../models/results/handle-message-result.js";
import { reconstructInputString } from "../util/array-helpers.js";
import { stringify } from "../util/object-helpers.js";
import tokenize from "./lexing-parsing/tokenize.js";

interface HandleMessageParams {
  readonly rollBotUserId: string | undefined;
  readonly message: {
    readonly authorUserId: string;
    readonly content: string;
  };
  readonly deps: {
    readonly tokenize: typeof tokenize;
    readonly prevLogger: Logger;
  };
}
const handleMessage = ({
  rollBotUserId,
  message,
  deps: { tokenize, prevLogger },
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
  if (message.authorUserId === rollBotUserId) {
    logger.info("Message is from roll-bot. Do not reply.");
    return { tag: "doNotReply" };
  }

  logger.info(
    "Message is not from roll-bot. Tokenize content:",
    message.content,
  );
  const tokenizationResult = tokenize({
    inputString: message.content,
    deps: {
      prevLogger: logger,
    },
  });
  switch (tokenizationResult.tag) {
    case "implementationError":
      logger.error(tokenizationResult);
      return {
        tag: "reply",
        data: stringify(tokenizationResult),
      };
    case "untokenizableInput":
      logger.warn(tokenizationResult);
      return {
        tag: "reply",
        data: stringify(tokenizationResult),
      };
    case "success": {
      const reconstructedInputString = reconstructInputString(
        tokenizationResult.data,
      );
      logger.info(
        "Tokenization successful. Echoing reconstructed input string:",
        reconstructedInputString,
      );
      return {
        tag: "reply",
        data: reconstructedInputString,
      };
    }
  }
};

export default handleMessage;
