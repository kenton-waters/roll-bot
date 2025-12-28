import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { nullLogger } from "../../util.js";
import TokenizeResult from "../../../src/models/results/tokenize-result.js";
import tokenize from "../../../src/core/lexing-parsing/tokenize.js";
import parse from "../../../src/core/lexing-parsing/parse.js";
import Token from "../../../src/models/lexing-parsing/token.js";

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

  void test("two whitespace tokens; failure; tokens not exhausted", () => {
    // Arrange
    const inputTokens: Token[] = [
      {
        tag: "whitespace",
        data: {
          stringToken: " ",
        },
      },
      {
        tag: "whitespace",
        data: {
          stringToken: " ",
        },
      },
    ];

    // Act
    const parseResult = parse({
      tokens: inputTokens,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "failure");
    assert.strictEqual(
      parseResult.data.reason,
      "Parsing did not exhaust tokens.",
    );
    assert.strictEqual(parseResult.data.remainingTokens.length, 1);
  });
});
