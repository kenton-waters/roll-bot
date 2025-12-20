import Logger from "../src/models/logger.js";

export const nullLogger: Logger = {
  info: function (): void {
    /* empty */
  },
  error: function (): void {
    /* empty */
  },
  clone: function (): Logger {
    return this;
  },
};
