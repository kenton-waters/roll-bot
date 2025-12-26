import type Logger from "../models/logger.js";
import type { BasicLogger } from "../models/logger.js";
import { trailWith } from "./array-helpers.js";

const SEPARATOR = "|";

export class ContextLogger implements Logger {
  private readonly basicLogger: BasicLogger;
  private readonly context: unknown[];

  constructor(basicLogger: BasicLogger, context?: unknown[]) {
    this.basicLogger = basicLogger;
    this.context = context ?? new Array<unknown>();
  }

  info(...data: unknown[]): void {
    this.basicLogger.info(...trailWith(this.context, SEPARATOR), ...data);
  }
  error(...data: unknown[]): void {
    this.basicLogger.error(
      ...trailWith(this.context, SEPARATOR),
      "ERROR:",
      ...data,
    );
  }

  clone(contextToAdd: unknown, ...toLog: unknown[]): Logger {
    const newLogger = new ContextLogger(this.basicLogger, [
      ...this.context,
      contextToAdd,
    ]);

    newLogger.info(...toLog);

    return newLogger;
  }
}
