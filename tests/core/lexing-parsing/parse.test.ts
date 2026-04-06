import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { nullLogger } from "../../util.js";
import type TokenizeResult from "../../../src/models/results/tokenize-result.js";
import tokenize from "../../../src/core/lexing-parsing/tokenize.js";
import parse from "../../../src/core/lexing-parsing/parse.js";
import type Token from "../../../src/models/lexing-parsing/token.js";
import {
  evaluate,
  reconstructInputString,
} from "../../../src/util/tree-helpers.js";

void describe("parse", () => {
  void test("empty input; failure", () => {
    // Arrange
    const inputString = "";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "failure");
    assert.strictEqual(
      parseResult.reason,
      "Expected nonnegative integer token not found when parsing integer atom.",
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
  });

  void test("only initial whitespace; failure", () => {
    // Arrange
    const inputString = "  ";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "failure");
    assert.strictEqual(
      parseResult.reason,
      "Expected nonnegative integer token not found when parsing integer atom.",
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
  });

  void test("only plus sign; failure", () => {
    // Arrange
    const inputString = "+";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "failure");
    assert.strictEqual(
      parseResult.reason,
      "Expected nonnegative integer token not found when parsing integer atom.",
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
  });

  void test("only minus sign; failure", () => {
    // Arrange
    const inputString = " - ";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "failure");
    assert.strictEqual(
      parseResult.reason,
      "Expected nonnegative integer token not found when parsing integer atom.",
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
  });

  void test("two whitespace tokens; failure", () => {
    // Arrange
    const inputTokens: Token[] = [
      {
        type: "whitespace",
        stringToken: " ",
      },
      {
        type: "whitespace",
        stringToken: " ",
      },
    ];

    // Act
    const parseResult = parse({
      tokens: inputTokens,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "failure");
    assert.strictEqual(
      parseResult.reason,
      "Expected nonnegative integer token not found when parsing integer atom.",
    );
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

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "success");
    assert.strictEqual(parseResult.parsedObject.expression?.type, "atom");
    assert.strictEqual(
      parseResult.parsedObject.expression.data.type,
      "integer",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.sign.signValue,
      "+",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.sign.signToken,
      null,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.numericValue,
      3,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.nonnegativeIntegerToken
        .stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.followingWhitespaceToken,
      null,
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
      inputString,
    );
  });

  void test("parenthetical integer; success", () => {
    // Arrange
    const inputString = " ( 3 ) ";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "success");
    assert.strictEqual(
      parseResult.parsedObject.expression?.type,
      "parenthetical",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.leftParen.followingWhitespaceToken
        ?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.internalExpression.type,
      "atom",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.internalExpression.data.type,
      "integer",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.internalExpression.data.numericValue,
      3,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.internalExpression.data
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.rightParen.followingWhitespaceToken
        ?.stringToken,
      " ",
    );
    assert.strictEqual(parseResult.remainingTokens.length, 0);
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
      inputString,
    );
  });

  void test("parenthetical then addition; success", () => {
    // Arrange
    const inputString = " ( 3 ) + 2";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "success");
    assert.strictEqual(
      reconstructInputString(parseResult.parsedObject),
      inputString,
    );
    assert.strictEqual(evaluate(parseResult.parsedObject), 5);
  });

  void test("negative integer; success", () => {
    // Arrange
    const inputString = "-3";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "success");
    assert.strictEqual(parseResult.parsedObject.expression?.type, "atom");
    assert.strictEqual(
      parseResult.parsedObject.expression.data.type,
      "integer",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.sign.signValue,
      "-",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.sign.signToken?.stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.numericValue,
      -3,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.nonnegativeIntegerToken
        .stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.followingWhitespaceToken,
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

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "success");
    assert.strictEqual(parseResult.parsedObject.expression?.type, "atom");
    assert.strictEqual(
      parseResult.parsedObject.expression.data.type,
      "integer",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.sign.signValue,
      "+",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.sign.signToken?.stringToken,
      "+",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.numericValue,
      3,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.nonnegativeIntegerToken
        .stringToken,
      "3",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.followingWhitespaceToken
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

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "success");
    assert.strictEqual(parseResult.parsedObject.expression?.type, "atom");
    assert.strictEqual(
      parseResult.parsedObject.expression.data.type,
      "diceRoll",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.sign.signValue,
      "-",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.sign.signToken?.stringToken,
      "-",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.numDice.numericValue,
      50,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.numDice.nonnegativeNumDiceToken
        ?.numericValue,
      50,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.numDice.followingWhitespaceToken
        ?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.dieSymbol.dieToken.stringToken,
      "D",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.dieSymbol
        .followingWhitespaceToken?.stringToken,
      " ",
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.positiveNumFacesToken
        .numericValue,
      20,
    );
    assert.strictEqual(
      parseResult.parsedObject.expression.data.followingWhitespaceToken
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

    assert.strictEqual(tokenizeResult.type, "success");

    const parseResult = parse({
      tokens: tokenizeResult,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.type, "success");
    assert.strictEqual(
      parseResult.parsedObject.expression?.type,
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
