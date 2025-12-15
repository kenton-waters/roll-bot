import { DISCORD_TOKEN } from "./constants/environment-variables.js";
import type Logger from "./models/logger.js";
import { loginAsDiscordBot } from "./core/login.js";
import getDiscordClient from "./factories/discord-client-factory.js";

const logger: Logger = console;

logger.log("[app] Executing roll-bot...");

if (DISCORD_TOKEN === undefined) {
  logger.error(
    "[app] DISCORD_TOKEN environment variable is undefined. Ending execution.",
  );
  process.exit(1);
}

await loginAsDiscordBot(logger, getDiscordClient(), DISCORD_TOKEN);
