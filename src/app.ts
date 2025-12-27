import { DISCORD_TOKEN } from "./constants/environment-variables.js";
import type Logger from "./models/logger.js";
import { startBot } from "./core/discord.js";
import createDiscordClient from "./factories/discord-client-factory.js";
import handleMessage from "./core/handle-message.js";
import createLogger from "./factories/logger-factory.js";

const logger: Logger = createLogger({
  basicLogger: console,
  context: ["app"],
});

logger.info("Executing roll-bot...");

if (DISCORD_TOKEN === undefined) {
  logger.error(
    "DISCORD_TOKEN environment variable is undefined. Ending execution.",
  );
  process.exit(1);
}

logger.info("Discord token retrieved. Starting bot...");
await startBot({
  discordClient: createDiscordClient(),
  discordToken: DISCORD_TOKEN,
  deps: {
    handleMessage: handleMessage,
    prevLogger: logger,
  },
});
