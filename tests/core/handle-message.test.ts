import { test, describe } from "node:test";
import assert from "node:assert/strict";
import Logger from "../../src/models/logger.js";
import { DiscordMessage } from "../../src/models/discord.js";
import { handleMessage } from "../../src/core/handle-message.js";

void describe("handleMessage", () => {
  void test("message from bot; do not reply", () => {
    // Arrange
    const mockLogger: Logger = {
      log: function (): void {
        /* empty */
      },
      error: function (): void {
        /* empty */
      },
    };

    const message: DiscordMessage = {
      authorIsBot: true,
      content: "blah",
    };

    // Act
    const result = handleMessage(mockLogger, message);

    // Assert
    assert.strictEqual(result.tag, "doNotReply");
  });
});
