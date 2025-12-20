import type Logger from "../models/logger.js";
import type { BasicLogger, CloneParams } from "../models/logger.js";

export class ContextLogger implements Logger {
  private readonly basicLogger: BasicLogger;
  private readonly context: unknown[];

  constructor(basicLogger: BasicLogger, context?: unknown[]) {
    this.basicLogger = basicLogger;
    this.context = context ?? new Array<unknown>();
  }

  info(...data: unknown[]): void {
    this.basicLogger.info([...this.context, ...data]);
  }
  error(...data: unknown[]): void {
    this.basicLogger.error([...this.context, "ERROR:", ...data]);
  }

  clone({ contextToAdd, toLog }: CloneParams): Logger {
    const newLogger = new ContextLogger(this.basicLogger, [
      ...this.context,
      contextToAdd,
    ]);

    newLogger.info(toLog);

    return newLogger;
  }
}
