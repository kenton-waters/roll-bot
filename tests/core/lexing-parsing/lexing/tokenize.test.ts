import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { nullLogger } from "../../../util.js";
import TokenizeResult from "../../../../src/models/results/tokenize-result.js";
import tokenize from "../../../../src/core/lexing-parsing/lexing/tokenize.js";

void describe("tokenize", () => {
  void test("immediate unexpected character; unexpectedCharacter at position 0", () => {
    // Arrange
    const inputString = "xABC";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.tag, "unexpectedCharacter");
    assert.strictEqual(tokenizeResult.data.character, "x");
    assert.strictEqual(tokenizeResult.data.position, 0);
  });

  void test("empty input; success; empty tokens array", () => {
    // Arrange
    const inputString = "";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.tag, "success");
    assert.strictEqual(tokenizeResult.data.length, 0);
  });
});
