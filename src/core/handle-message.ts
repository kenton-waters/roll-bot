import type Logger from "../models/logger.js";
import type HandleMessageResult from "../models/results/handle-message-result.js";
import { stringify } from "../util/object-helpers.js";
import { evaluate } from "../util/tree-helpers.js";
import type parse from "./lexing-parsing/parse.js";
import tokenize from "./lexing-parsing/tokenize.js";

interface HandleMessageParams {
  readonly rollBotUserId: string | undefined;
  readonly message: {
    readonly authorUserId: string;
    readonly content: string;
  };
  readonly deps: {
    readonly tokenize: typeof tokenize;
    readonly parse: typeof parse;
    readonly evaluate: typeof evaluate;
    readonly prevLogger: Logger;
  };
}
const handleMessage = ({
  rollBotUserId,
  message,
  deps: { tokenize, parse, prevLogger },
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
    return { type: "doNotReply" };
  }

  logger.info("Checking whether message was sent by roll-bot...");
  if (message.authorUserId === rollBotUserId) {
    logger.info("Message is from roll-bot. Do not reply.");
    return { type: "doNotReply" };
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
  switch (tokenizationResult.type) {
    case "implementationError":
      logger.error(tokenizationResult);
      return {
        type: "reply",
        string: stringify(tokenizationResult),
      };
    case "untokenizableInput":
      logger.warn(tokenizationResult);
      return {
        type: "reply",
        string: stringify(tokenizationResult),
      };
    case "success": {
      logger.info("Tokenization successful. Parsing...");

      const parseResult = parse({
        tokens: tokenizationResult.array,
        deps: {
          prevLogger: logger,
        },
      });

      switch (parseResult.type) {
        case "failure":
          logger.warn(parseResult);
          return {
            type: "reply",
            string: stringify(parseResult),
          };
        case "success": {
          logger.info("Parsing successful. Evaluating total...");
          const total = evaluate(parseResult.parsedObject);
          logger.info("Evaluation successful. Replying with total", total);
          return {
            type: "reply",
            string: total.toString(),
          };
        }
      }
    }
  }
};

export default handleMessage;
