import Logger from "../src/models/logger.js";

export const nullLogger: Logger = {
  log: function (): void {
    /* empty */
  },
  error: function (): void {
    /* empty */
  },
};
