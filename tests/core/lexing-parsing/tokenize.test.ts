import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { nullLogger } from "../../util.js";
import type TokenizeResult from "../../../src/models/results/tokenize-result.js";
import tokenize from "../../../src/core/lexing-parsing/tokenize.js";

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
    assert.strictEqual(tokenizeResult.type, "untokenizableInput");
    assert.strictEqual(tokenizeResult.untokenizableRemnant, "xABC");
    assert.strictEqual(tokenizeResult.failurePosition, 0);
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
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 0);
  });

  void test("integer input; success; one integer token", () => {
    // Arrange
    const inputString = "0012342500";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 1);
    assert.strictEqual(tokenizeResult[0]?.type, "nonnegativeInteger");
    assert.strictEqual(tokenizeResult[0].numericValue, 12342500);
    assert.strictEqual(tokenizeResult[0].stringToken, "0012342500");
  });

  void test("unexpectedCharacter; at position 5", () => {
    // Arrange
    const inputString = "01234x6789";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "untokenizableInput");
    assert.strictEqual(tokenizeResult.untokenizableRemnant, "x6789");
    assert.strictEqual(tokenizeResult.failurePosition, 5);
  });

  void test("1d20; success; three tokens", () => {
    // Arrange
    const inputString = "1d20";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 3);
    assert.strictEqual(tokenizeResult[1]?.type, "die");
    assert.strictEqual(tokenizeResult[1].stringToken, "d");
  });

  void test("1D20; success; three tokens", () => {
    // Arrange
    const inputString = "1D20";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 3);
    assert.strictEqual(tokenizeResult[1]?.type, "die");
    assert.strictEqual(tokenizeResult[1].stringToken, "D");
  });

  void test("multiplication and division; success; two tokens", () => {
    // Arrange
    const inputString = "*/";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 2);
    assert.strictEqual(tokenizeResult[0]?.type, "multiplication");
    assert.strictEqual(tokenizeResult[0].stringToken, "*");
    assert.strictEqual(tokenizeResult[1]?.type, "division");
    assert.strictEqual(tokenizeResult[1].stringToken, "/");
  });

  void test("whitespace input; success", () => {
    // Arrange
    const inputString = "   \t  \n  ";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 1);
    assert.strictEqual(tokenizeResult[0]?.type, "whitespace");
    assert.strictEqual(tokenizeResult[0].stringToken, "   \t  \n  ");
  });

  void test("addition input; success", () => {
    // Arrange
    const inputString = " 1 d 20 + 3 ";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 11);
    assert.strictEqual(tokenizeResult[7]?.type, "addition");
    assert.strictEqual(tokenizeResult[7].stringToken, "+");
  });

  void test("subtraction input; success", () => {
    // Arrange
    const inputString = " 1 d 20 - 3 ";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 11);
    assert.strictEqual(tokenizeResult[7]?.type, "subtraction");
    assert.strictEqual(tokenizeResult[7].stringToken, "-");
  });

  void test("left parenthesis input; success", () => {
    // Arrange
    const inputString = "(";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 1);
    assert.strictEqual(tokenizeResult[0]?.type, "leftParen");
    assert.strictEqual(tokenizeResult[0].stringToken, "(");
  });

  void test("right parenthesis input; success", () => {
    // Arrange
    const inputString = ")";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.type, "success");
    assert.strictEqual(tokenizeResult.length, 1);
    assert.strictEqual(tokenizeResult[0]?.type, "rightParen");
    assert.strictEqual(tokenizeResult[0].stringToken, ")");
  });
});
