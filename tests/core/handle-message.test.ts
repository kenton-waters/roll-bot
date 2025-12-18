import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { DiscordMessage } from "../../src/models/discord.js";
import { handleMessage } from "../../src/core/handle-message.js";
import { nullLogger } from "../util.js";

void describe("handleMessage", () => {
  void test("message from bot; do not reply", () => {
    // Arrange
    const message: DiscordMessage = {
      isAuthorBot: true,
      content: "blah",
    };

    // Act
    const handleMessageResult = handleMessage({
      message: message,
      deps: { logger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "doNotReply");
  });
});
