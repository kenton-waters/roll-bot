import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { nullLogger } from "../../util.js";
import TokenizeResult from "../../../src/models/results/tokenize-result.js";
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
    assert.strictEqual(tokenizeResult.tag, "untokenizableInput");
    assert.strictEqual(tokenizeResult.payload.untokenizableRemnant, "xABC");
    assert.strictEqual(tokenizeResult.payload.failurePosition, 0);
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
    assert.strictEqual(tokenizeResult.payload.length, 0);
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
    assert.strictEqual(tokenizeResult.payload.length, 1);
    assert.strictEqual(tokenizeResult.payload[0].tag, "nonnegativeInteger");
    assert.strictEqual(
      tokenizeResult.payload[0].payload.numericValue,
      12342500,
    );
    assert.strictEqual(
      tokenizeResult.payload[0].payload.stringToken,
      "0012342500",
    );
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
    assert.strictEqual(tokenizeResult.tag, "untokenizableInput");
    assert.strictEqual(tokenizeResult.payload.untokenizableRemnant, "x6789");
    assert.strictEqual(tokenizeResult.payload.failurePosition, 5);
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
    assert.strictEqual(tokenizeResult.payload.length, 3);
    assert.strictEqual(tokenizeResult.payload[1].tag, "die");
    assert.strictEqual(tokenizeResult.payload[1].payload.stringToken, "d");
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
    assert.strictEqual(tokenizeResult.payload.length, 3);
    assert.strictEqual(tokenizeResult.payload[1].tag, "die");
    assert.strictEqual(tokenizeResult.payload[1].payload.stringToken, "D");
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
    assert.strictEqual(tokenizeResult.payload.length, 1);
    assert.strictEqual(tokenizeResult.payload[0].tag, "whitespace");
    assert.strictEqual(
      tokenizeResult.payload[0].payload.stringToken,
      "   \t  \n  ",
    );
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
    assert.strictEqual(tokenizeResult.payload.length, 11);
    assert.strictEqual(tokenizeResult.payload[7].tag, "plusSign");
    assert.strictEqual(tokenizeResult.payload[7].payload.stringToken, "+");
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
    assert.strictEqual(tokenizeResult.payload.length, 11);
    assert.strictEqual(tokenizeResult.payload[7].tag, "minusSign");
    assert.strictEqual(tokenizeResult.payload[7].payload.stringToken, "-");
  });
});
