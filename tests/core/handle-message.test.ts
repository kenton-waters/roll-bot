import { test, describe } from "node:test";
import assert from "node:assert/strict";
import handleMessage from "../../src/core/handle-message.js";
import { nullLogger, nullTokenize } from "../util.js";
import tokenize from "../../src/core/lexing-parsing/tokenize.js";

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
      deps: { tokenize: nullTokenize, prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "doNotReply");
  });

  void test("message not from bot; echo content", () => {
    // Arrange
    const message = {
      authorUserId: "authorId",
      content: " 1 d 20 - 5 ",
    };

    // Act
    const handleMessageResult = handleMessage({
      rollBotUserId: "botId",
      message: message,
      deps: { tokenize: tokenize, prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "reply");
    assert.strictEqual(handleMessageResult.data, " 1 d 20 - 5 ");
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
      deps: { tokenize: nullTokenize, prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "doNotReply");
  });

  void test("tokenizer implementation error; reply with error", () => {
    // Arrange
    const message = {
      authorUserId: "authorId",
      content: "blah",
    };

    // Act
    const handleMessageResult = handleMessage({
      rollBotUserId: "botId",
      message: message,
      deps: { tokenize: nullTokenize, prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "reply");
    assert.strictEqual(
      handleMessageResult.data,
      '{\n  "tag": "implementationError",\n  "data": {\n    "message": "",\n    "tokenizedInput": "",\n    "failurePosition": 0,\n    "untokenizableRemnant": ""\n  }\n}',
    );
  });

  void test("untokenizableInput; reply with validation error", () => {
    // Arrange
    const message = {
      authorUserId: "authorId",
      content: "blah",
    };

    // Act
    const handleMessageResult = handleMessage({
      rollBotUserId: "botId",
      message: message,
      deps: { tokenize: tokenize, prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.tag, "reply");
    assert.strictEqual(
      handleMessageResult.data,
      '{\n  "tag": "untokenizableInput",\n  "data": {\n    "tokenizedInput": "",\n    "failurePosition": 0,\n    "untokenizableRemnant": "blah"\n  }\n}',
    );
  });
});
