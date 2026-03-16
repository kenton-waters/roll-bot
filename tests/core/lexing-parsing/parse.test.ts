import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { nullLogger } from "../../util.js";
import type TokenizeResult from "../../../src/models/results/tokenize-result.js";
import tokenize from "../../../src/core/lexing-parsing/tokenize.js";
import parse from "../../../src/core/lexing-parsing/parse.js";
import type Token from "../../../src/models/lexing-parsing/token.js";
import { reconstructInputString } from "../../../src/util/tree-helpers.js";

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
      tokens: tokenizeResult.payload,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.payload.parsedObject.initialWhitespaceToken,
      null,
    );
    assert.strictEqual(parseResult.payload.parsedObject.expression, null);
    assert.strictEqual(parseResult.payload.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.payload.parsedObject),
      inputString,
    );
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
      tokens: tokenizeResult.payload,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.payload.parsedObject.initialWhitespaceToken?.stringToken,
      "  ",
    );
    assert.strictEqual(parseResult.payload.parsedObject.expression, null);
    assert.strictEqual(parseResult.payload.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.payload.parsedObject),
      inputString,
    );
  });

  void test("two whitespace tokens; failure; tokens not exhausted", () => {
    // Arrange
    const inputTokens: Token[] = [
      {
        tag: "whitespace",
        payload: {
          stringToken: " ",
        },
      },
      {
        tag: "whitespace",
        payload: {
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
      parseResult.payload.reason,
      "Parsing did not exhaust tokens.",
    );
    assert.strictEqual(parseResult.payload.remainingTokens.length, 1);
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
      tokens: tokenizeResult.payload,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.payload.parsedObject.expression?.tag,
      "atom",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.tag,
      "integer",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.sign
        .signValue,
      "+",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.sign
        .signToken,
      null,
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.numericValue,
      3,
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload
        .nonnegativeIntegerToken.stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload
        .followingWhitespaceToken,
      null,
    );
    assert.strictEqual(parseResult.payload.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.payload.parsedObject),
      inputString,
    );
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
      tokens: tokenizeResult.payload,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.payload.parsedObject.expression?.tag,
      "atom",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.tag,
      "integer",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.sign
        .signValue,
      "-",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.sign.signToken
        ?.stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.numericValue,
      -3,
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload
        .nonnegativeIntegerToken.stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload
        .followingWhitespaceToken,
      null,
    );
    assert.strictEqual(parseResult.payload.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.payload.parsedObject),
      inputString,
    );
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
      tokens: tokenizeResult.payload,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.payload.parsedObject.expression?.tag,
      "atom",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.tag,
      "integer",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.sign
        .signValue,
      "+",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.sign.signToken
        ?.stringToken,
      "+",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.numericValue,
      3,
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload
        .nonnegativeIntegerToken.stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(parseResult.payload.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.payload.parsedObject),
      inputString,
    );
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
      tokens: tokenizeResult.payload,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.payload.parsedObject.expression?.tag,
      "atom",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.tag,
      "diceRoll",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.sign
        .signValue,
      "-",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.sign.signToken
        ?.stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.numDice
        .numericValue,
      50,
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.numDice
        .nonnegativeNumDiceToken?.numericValue,
      50,
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.numDice
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.dieSymbol
        .dieToken.stringToken,
      "D",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload.dieSymbol
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload
        .positiveNumFacesToken.numericValue,
      20,
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.payload
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(parseResult.payload.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.payload.parsedObject),
      inputString,
    );
  });

  void test("subtraction; success", () => {
    // Arrange
    const inputString = "0- 0";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.tag, "success");

    const parseResult = parse({
      tokens: tokenizeResult.payload,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.payload.parsedObject.expression?.tag,
      "additionOrSubtraction",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload.operatorToken
        .stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.payload.parsedObject.expression.payload
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(parseResult.payload.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.payload.parsedObject),
      inputString,
    );
  });
});
