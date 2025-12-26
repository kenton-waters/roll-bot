import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { handleMessage } from "../../src/core/handle-message.js";
import { nullLogger } from "../util.js";

void describe("handleMessage", () => {
  void test("message from bot; do not reply", () => {
    // Arrange
    const message = {
      isAuthorBot: true,
      content: "blah",
    };

    // Act
    const handleMessageResult = handleMessage({
      message: message,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "doNotReply");
  });

  void test("message not from bot; echo content", () => {
    // Arrange
    const message = {
      isAuthorBot: false,
      content: "blah",
    };

    // Act
    const handleMessageResult = handleMessage({
      message: message,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "reply");
    assert.strictEqual(handleMessageResult.data, "blah");
  });
});
