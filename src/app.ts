import { DISCORD_TOKEN } from "./constants/environment-variables.js";
import type Logger from "./models/logger.js";
import { startBot } from "./core/discord.js";
import createDiscordClient from "./factories/discord-client-factory.js";
import { handleMessage } from "./core/handle-message.js";
import createLogger from "./factories/logger-factory.js";

const logger: Logger = createLogger(console);

logger.info("[app] Executing roll-bot...");

if (DISCORD_TOKEN === undefined) {
  logger.error(
    "[app] DISCORD_TOKEN environment variable is undefined. Ending execution.",
  );
  process.exit(1);
}

await startBot({
  discordClient: createDiscordClient(),
  discordToken: DISCORD_TOKEN,
  deps: {
    handleMessage: handleMessage,
    logger: logger,
  },
});
