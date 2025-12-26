import type Logger from "../models/logger.js";
import type { BasicLogger } from "../models/logger.js";
import { followEachWith } from "./array-helpers.js";

const SEPARATOR = "|";

export class ContextLogger implements Logger {
  private readonly basicLogger: BasicLogger;
  private readonly context: unknown[];

  constructor(basicLogger: BasicLogger, context?: unknown[]) {
    this.basicLogger = basicLogger;
    this.context = context ?? new Array<unknown>();
  }

  info(...data: unknown[]): void {
    this.basicLogger.info(...followEachWith(this.context, SEPARATOR), ...data);
  }
  error(...data: unknown[]): void {
    this.basicLogger.error(
      ...followEachWith(this.context, SEPARATOR),
      "ERROR:",
      ...data,
    );
  }

  logWithNew(contextToAdd: unknown, ...toLogWithNew: unknown[]): Logger {
    const newLogger = new ContextLogger(this.basicLogger, [
      ...this.context,
      contextToAdd,
    ]);

    newLogger.info(...toLogWithNew);

    return newLogger;
  }
}
