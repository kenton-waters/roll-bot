import { type BasicLogger } from "../models/logger.js";
import { ContextLogger } from "../util/logger.js";
import type Logger from "../models/logger.js";

interface CreateLoggerParams {
  readonly basicLogger: BasicLogger;
  readonly context?: unknown[];
}
const createLogger = ({ basicLogger, context }: CreateLoggerParams): Logger => {
  return new ContextLogger(basicLogger, context);
};

export default createLogger;
