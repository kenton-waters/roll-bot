import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { handleMessage } from "../../src/core/handle-message.js";
import { nullLogger } from "../util.js";

void describe("handleMessage", () => {
  void test("message from bot; do not reply", () => {
    // Arrange
    const message = {
      authorUserId: "botId",
      content: "blah",
    };

    // Act
    const handleMessageResult = handleMessage({
      rollBotUserId: "botId",
      message: message,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "doNotReply");
  });

  void test("message not from bot; echo content", () => {
    // Arrange
    const message = {
      authorUserId: "authorId",
      content: "blah",
    };

    // Act
    const handleMessageResult = handleMessage({
      rollBotUserId: "botId",
      message: message,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "reply");
    assert.strictEqual(handleMessageResult.data, "blah");
  });

  void test("no bot user id; do not reply", () => {
    // Arrange
    const message = {
      authorUserId: "authorId",
      content: "blah",
    };

    // Act
    const handleMessageResult = handleMessage({
      rollBotUserId: undefined,
      message: message,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "doNotReply");
  });
});
