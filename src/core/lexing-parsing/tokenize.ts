import {
  die,
  integer as nonnegativeInteger,
  subtraction,
  addition,
  whitespace,
  leftParen,
  rightParen,
  multiplication,
  division,
} from "../../constants/regular-expressions.js";
import type Token from "../../models/lexing-parsing/token.js";
import type Logger from "../../models/logger.js";
import type TokenizeResult from "../../models/results/tokenize-result.js";
import { reconstructInputString } from "../../util/array-helpers.js";

interface TokenizeParams {
  readonly inputString: string;
  readonly deps: {
    prevLogger: Logger;
  };
}
const tokenize = ({
  inputString,
  deps: { prevLogger },
}: TokenizeParams): TokenizeResult => {
  const logger = prevLogger.logWithNew(
    "tokenize",
    "Tokenizing input string:",
    inputString,
  );

  const go = (remainingInput: string, pastTokens: Token[]): TokenizeResult => {
    if (remainingInput.length === 0)
      return Object.assign([...pastTokens], { type: "success" as const });

    const nonnegativeIntegerMatch = remainingInput.match(nonnegativeInteger);
    if (nonnegativeIntegerMatch) {
      const stringToken = nonnegativeIntegerMatch[0];
      return go(remainingInput.slice(stringToken.length), [
        ...pastTokens,
        {
          type: "nonnegativeInteger",
          numericValue: parseInt(stringToken),
          stringToken: stringToken,
        },
      ]);
    }

    const dieMatch = remainingInput.match(die);
    if (dieMatch) {
      const stringToken = dieMatch[0];
      if (stringToken !== "D" && stringToken !== "d") {
        const reconstructedInputString = reconstructInputString(pastTokens);
        const err: TokenizeResult = {
          type: "implementationError",
          message: `String ${stringToken} was tokenized as "die" but is neither "D" nor "d"`,
          tokenizedInput: reconstructedInputString,
          failurePosition: reconstructedInputString.length,
          untokenizableRemnant: remainingInput,
        };
        logger.error(err);
        return err;
      }

      return go(remainingInput.slice(stringToken.length), [
        ...pastTokens,
        {
          type: "die",
          stringToken: stringToken,
        },
      ]);
    }

    const additionMatch = remainingInput.match(addition);
    if (additionMatch) {
      return go(remainingInput.slice(additionMatch[0].length), [
        ...pastTokens,
        {
          type: "addition",
          stringToken: "+",
        },
      ]);
    }

    const subtractionMatch = remainingInput.match(subtraction);
    if (subtractionMatch) {
      return go(remainingInput.slice(subtractionMatch[0].length), [
        ...pastTokens,
        {
          type: "subtraction",
          stringToken: "-",
        },
      ]);
    }

    const multiplicationMatch = remainingInput.match(multiplication);
    if (multiplicationMatch) {
      return go(remainingInput.slice(multiplicationMatch[0].length), [
        ...pastTokens,
        {
          type: "multiplication",
          stringToken: "*",
        },
      ]);
    }

    const divisionMatch = remainingInput.match(division);
    if (divisionMatch) {
      return go(remainingInput.slice(divisionMatch[0].length), [
        ...pastTokens,
        {
          type: "division",
          stringToken: "/",
        },
      ]);
    }

    const whitespaceMatch = remainingInput.match(whitespace);
    if (whitespaceMatch) {
      const stringToken = whitespaceMatch[0];
      return go(remainingInput.slice(stringToken.length), [
        ...pastTokens,
        {
          type: "whitespace",
          stringToken: stringToken,
        },
      ]);
    }

    const leftParenMatch = remainingInput.match(leftParen);
    if (leftParenMatch) {
      const stringToken = leftParenMatch[0];
      return go(remainingInput.slice(stringToken.length), [
        ...pastTokens,
        {
          type: "leftParen",
          stringToken: "(",
        },
      ]);
    }

    const rightParenMatch = remainingInput.match(rightParen);
    if (rightParenMatch) {
      const stringToken = rightParenMatch[0];
      return go(remainingInput.slice(stringToken.length), [
        ...pastTokens,
        {
          type: "rightParen",
          stringToken: ")",
        },
      ]);
    }

    const reconstructedInputString = reconstructInputString(pastTokens);
    return {
      type: "untokenizableInput",
      tokenizedInput: reconstructedInputString,
      failurePosition: reconstructedInputString.length,
      untokenizableRemnant: remainingInput,
    };
  };
  return go(inputString, []);
};

export default tokenize;
