import tokenize from "../src/core/lexing-parsing/tokenize.js";
import type Logger from "../src/models/logger.js";

export const nullLogger: Logger = {
  info: function (): void {
    /* empty */
  },
  warn: function (): void {
    /* empty */
  },
  error: function (): void {
    /* empty */
  },
  logWithNew: function (): Logger {
    return this;
  },
};

export const nullTokenize: typeof tokenize = () => {
  return {
    tag: "implementationError",
    message: "",
    tokenizedInput: "",
    failurePosition: 0,
    untokenizableRemnant: "",
  };
};
