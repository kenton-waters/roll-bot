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

  void test("integer; success", () => {
    // Arrange
    const inputString = "3";

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
    assert.strictEqual(parseResult.data.parsedObject.expression?.tag, "atom");
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.tag,
      "integer",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.sign.signValue,
      "+",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.sign.signToken,
      null,
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.numericValue,
      3,
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.nonnegativeIntegerToken
        .stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data
        .followingWhitespaceToken,
      null,
    );
    assert.strictEqual(parseResult.data.remainingTokens.length, 0);
  });

  void test("negative integer; success", () => {
    // Arrange
    const inputString = "-3";

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
    assert.strictEqual(parseResult.data.parsedObject.expression?.tag, "atom");
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.tag,
      "integer",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.sign.signValue,
      "-",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.sign.signToken
        ?.stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.numericValue,
      -3,
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.nonnegativeIntegerToken
        .stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data
        .followingWhitespaceToken,
      null,
    );
    assert.strictEqual(parseResult.data.remainingTokens.length, 0);
  });

  void test("signed integer with whitespace; success", () => {
    // Arrange
    const inputString = " + 3 ";

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
    assert.strictEqual(parseResult.data.parsedObject.expression?.tag, "atom");
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.tag,
      "integer",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.sign.signValue,
      "+",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.sign.signToken
        ?.stringToken,
      "+",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.numericValue,
      3,
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.nonnegativeIntegerToken
        .stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(parseResult.data.remainingTokens.length, 0);
  });

  void test("dice roll; success", () => {
    // Arrange
    const inputString = " - 50 D 20 ";

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
    assert.strictEqual(parseResult.data.parsedObject.expression?.tag, "atom");
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.tag,
      "diceRoll",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.sign.signValue,
      "-",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.sign.signToken
        ?.stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.numDice.numericValue,
      50,
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.numDice
        .nonnegativeNumDiceToken?.numericValue,
      50,
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.numDice
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.dieSymbol.dieToken
        .stringToken,
      "D",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.dieSymbol
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data.positiveNumFacesToken
        .numericValue,
      20,
    );
    assert.strictEqual(
      parseResult.data.parsedObject.expression.data.data
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(parseResult.data.remainingTokens.length, 0);
  });
});
