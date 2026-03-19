import { test, describe } from "node:test";
import assert from "node:assert/strict";
import handleMessage from "../../src/core/handle-message.js";
import { nullLogger, nullTokenize } from "../util.js";
import tokenize from "../../src/core/lexing-parsing/tokenize.js";
import parse from "../../src/core/lexing-parsing/parse.js";
import { evaluate } from "../../src/util/tree-helpers.js";

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
      deps: { tokenize: nullTokenize, parse, evaluate, prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.type, "doNotReply");
  });

  void test("message not from bot; evaluate", () => {
    // Arrange
    const message = {
      authorUserId: "authorId",
      content: " 1 d 20 - 5 ",
    };

    // Act
    const handleMessageResult = handleMessage({
      rollBotUserId: "botId",
      message: message,
      deps: { tokenize: tokenize, parse, evaluate, prevLogger: nullLogger },
    });

    assert.strictEqual(handleMessageResult.type, "reply");
    const result: number = parseInt(handleMessageResult.string);

    // Assert
    assert.ok(result >= -4);
    assert.ok(result <= 25);
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
      deps: { tokenize: nullTokenize, parse, evaluate, prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.type, "doNotReply");
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
      deps: { tokenize: nullTokenize, parse, evaluate, prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.type, "reply");
    assert.strictEqual(
      handleMessageResult.string,
      '{\n  "type": "implementationError",\n  "message": "",\n  "tokenizedInput": "",\n  "failurePosition": 0,\n  "untokenizableRemnant": ""\n}',
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
      deps: { tokenize: tokenize, parse, evaluate, prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(handleMessageResult.type, "reply");
    assert.strictEqual(
      handleMessageResult.string,
      '{\n  "type": "untokenizableInput",\n  "tokenizedInput": "",\n  "failurePosition": 0,\n  "untokenizableRemnant": "blah"\n}',
    );
  });
});
