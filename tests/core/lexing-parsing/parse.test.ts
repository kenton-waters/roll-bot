import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { nullLogger } from "../../util.js";
import TokenizeResult from "../../../src/models/results/tokenize-result.js";
import tokenize from "../../../src/core/lexing-parsing/tokenize.js";
import parse from "../../../src/core/lexing-parsing/parse.js";
import ParseResult from "../../../src/models/results/parse-result.js";

void describe("parse", () => {
  void test("consecutive integers; unparseableInput at position 5", () => {
    // Arrange
    const inputString = " 010 050 ";

    // Act
    const tokenizeResult: TokenizeResult = tokenize({
      inputString: inputString,
      deps: { prevLogger: nullLogger },
    });

    assert.strictEqual(tokenizeResult.tag, "success");

    const parseResult: ParseResult = parse({
      tokens: tokenizeResult.data,
      deps: { prevLogger: nullLogger },
    });

    // Assert
    assert.strictEqual(parseResult.tag, "unparseableInput");
    assert.strictEqual(parseResult.data.parsedInput, " 010 ");
    assert.strictEqual(parseResult.data.failurePosition, 5);
    assert.strictEqual(parseResult.data.unparseableRemnant, "050 ");
  });
});
