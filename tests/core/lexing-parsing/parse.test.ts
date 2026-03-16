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
      tokens: tokenizeResult.array,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(parseResult.parsedObject.initialWhitespaceToken, null);
    assert.strictEqual(parseResult.parsedObject.expression, null);
    assert.strictEqual(parseResult.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
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
      tokens: tokenizeResult.array,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.parsedObject.initialWhitespaceToken?.stringToken,
      "  ",
    );
    assert.strictEqual(parseResult.parsedObject.expression, null);
    assert.strictEqual(parseResult.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
      inputString,
    );
  });

  void test("two whitespace tokens; failure; tokens not exhausted", () => {
    // Arrange
    const inputTokens: Token[] = [
      {
        tag: "whitespace",
        stringToken: " ",
      },
      {
        tag: "whitespace",
        stringToken: " ",
      },
    ];

    // Act
    const parseResult = parse({
      tokens: inputTokens,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "failure");
    assert.strictEqual(parseResult.reason, "Parsing did not exhaust tokens.");
    assert.strictEqual(parseResult.remainingTokens.length, 1);
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
      tokens: tokenizeResult.array,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(parseResult.parsedObject.expression?.tag, "atom");
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.tag,
      "integer",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.sign.signValue,
      "+",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.sign.signToken,
      null,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.numericValue,
      3,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.nonnegativeIntegerToken
        .stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.followingWhitespaceToken,
      null,
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
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
      tokens: tokenizeResult.array,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(parseResult.parsedObject.expression?.tag, "atom");
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.tag,
      "integer",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.sign.signValue,
      "-",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.sign.signToken?.stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.numericValue,
      -3,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.nonnegativeIntegerToken
        .stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.followingWhitespaceToken,
      null,
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
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
      tokens: tokenizeResult.array,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(parseResult.parsedObject.expression?.tag, "atom");
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.tag,
      "integer",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.sign.signValue,
      "+",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.sign.signToken?.stringToken,
      "+",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.numericValue,
      3,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.nonnegativeIntegerToken
        .stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.followingWhitespaceToken
        ?.stringToken,
      " ",
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
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
      tokens: tokenizeResult.array,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(parseResult.parsedObject.expression?.tag, "atom");
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.tag,
      "diceRoll",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.sign.signValue,
      "-",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.sign.signToken?.stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.numDice.numericValue,
      50,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.numDice
        .nonnegativeNumDiceToken?.numericValue,
      50,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.numDice
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.dieSymbol.dieToken
        .stringToken,
      "D",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.dieSymbol
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.positiveNumFacesToken
        .numericValue,
      20,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.payload.followingWhitespaceToken
        ?.stringToken,
      " ",
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
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
      tokens: tokenizeResult.array,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "success");
    assert.strictEqual(
      parseResult.parsedObject.expression?.tag,
      "additionOrSubtraction",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.operatorToken.stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
      inputString,
    );
  });
});
