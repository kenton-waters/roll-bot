import { type BasicLogger } from "../models/logger.js";
import { ContextLogger } from "../util/logger.js";
import type Logger from "../models/logger.js";

const createLogger = (basicLogger: BasicLogger): Logger => {
  return new ContextLogger(basicLogger);
};

export default createLogger;
