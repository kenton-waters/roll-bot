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
    assert.strictEqual(tokenizeResult.data.untokenizableRemnant, "xABC");
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

  void test("integer input; success; one integer token", () => {
    // Arrange
    const inputString = "0012342500";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(tokenizeResult.tag, "success");
    assert.strictEqual(tokenizeResult.data.length, 1);
    assert.strictEqual(tokenizeResult.data[0].tag, "integer");
    assert.strictEqual(tokenizeResult.data[0].data.numericValue, 12342500);
    assert.strictEqual(tokenizeResult.data[0].data.stringToken, "0012342500");
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
    assert.strictEqual(tokenizeResult.tag, "unexpectedCharacter");
    assert.strictEqual(tokenizeResult.data.untokenizableRemnant, "x6789");
    assert.strictEqual(tokenizeResult.data.position, 5);
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
    assert.strictEqual(tokenizeResult.tag, "success");
    assert.strictEqual(tokenizeResult.data.length, 3);
    assert.strictEqual(tokenizeResult.data[1].tag, "die");
    assert.strictEqual(tokenizeResult.data[1].data.stringToken, "d");
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
    assert.strictEqual(tokenizeResult.tag, "success");
    assert.strictEqual(tokenizeResult.data.length, 3);
    assert.strictEqual(tokenizeResult.data[1].tag, "die");
    assert.strictEqual(tokenizeResult.data[1].data.stringToken, "D");
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
    assert.strictEqual(tokenizeResult.tag, "success");
    assert.strictEqual(tokenizeResult.data.length, 1);
    assert.strictEqual(tokenizeResult.data[0].tag, "whitespace");
    assert.strictEqual(tokenizeResult.data[0].data.stringToken, "   \t  \n  ");
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
    assert.strictEqual(tokenizeResult.tag, "success");
    assert.strictEqual(tokenizeResult.data.length, 11);
    assert.strictEqual(tokenizeResult.data[7].tag, "plusSign");
    assert.strictEqual(tokenizeResult.data[7].data.stringToken, "+");
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
    assert.strictEqual(tokenizeResult.tag, "success");
    assert.strictEqual(tokenizeResult.data.length, 11);
    assert.strictEqual(tokenizeResult.data[7].tag, "minusSign");
    assert.strictEqual(tokenizeResult.data[7].data.stringToken, "-");
  });
});
