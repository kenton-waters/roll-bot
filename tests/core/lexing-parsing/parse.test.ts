import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { nullLogger } from "../../util.js";
import TokenizeResult from "../../../src/models/results/tokenize-result.js";
import tokenize from "../../../src/core/lexing-parsing/tokenize.js";
import parse from "../../../src/core/lexing-parsing/parse.js";

void describe("parse", () => {
  void test("empty input; success", () => {
    // Arrange
    const inputString = "";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.tag, "success");

    const parseResult = parse({
      tokens: tokenizeResult.data,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.data.parsedObject.initialWhitespaceToken,
      null,
    );
    assert.strictEqual(parseResult.data.parsedObject.expression, null);
    assert.strictEqual(parseResult.data.remainingTokens.length, 0);
  });

  void test("only initial whitespace; success", () => {
    // Arrange
    const inputString = "  ";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.tag, "success");

    const parseResult = parse({
      tokens: tokenizeResult.data,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.data.parsedObject.initialWhitespaceToken?.stringToken,
      "  ",
    );
    assert.strictEqual(parseResult.data.parsedObject.expression, null);
    assert.strictEqual(parseResult.data.remainingTokens.length, 0);
  });
});
