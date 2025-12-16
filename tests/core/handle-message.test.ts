import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { message } from "../../src/constants/message.js";

void describe("handleMessage", () => {
  void test("id function", () => {
    // Arrange
    const id = <T>(input: T) => input;

    // Act
    const result = id(message);

    // Assert
    assert.strictEqual(result, "Hello, Node.js with TypeScript!");
  });
});
