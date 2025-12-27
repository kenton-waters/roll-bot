import {
  die,
  integer,
  minusSign,
  plusSign,
  whitespace,
} from "../../constants/regular-expressions.js";
import type Token from "../../models/lexing-parsing/token.js";
import type Logger from "../../models/logger.js";
import type TokenizeResult from "../../models/results/tokenize-result.js";
import { inputStringLength } from "../../util/array-helpers.js";

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
      return { tag: "success", data: pastTokens };

    const integerMatch = remainingInput.match(integer);
    if (integerMatch) {
      const stringToken = integerMatch[0];
      return go(remainingInput.slice(stringToken.length), [
        ...pastTokens,
        {
          tag: "integer",
          data: {
            numericValue: parseInt(stringToken),
            stringToken: stringToken,
          },
        },
      ]);
    }

    const dieMatch = remainingInput.match(die);
    if (dieMatch) {
      const stringToken = dieMatch[0];
      if (stringToken !== "D" && stringToken !== "d") {
        const err: TokenizeResult = {
          tag: "implementationError",
          data: {
            message: `String ${stringToken} was tokenized as "die" but is neither "D" nor "d"`,
            inputString: inputString,
            position: inputStringLength(pastTokens),
            untokenizableRemnant: remainingInput,
          },
        };
        logger.error(err);
        return err;
      }

      return go(remainingInput.slice(stringToken.length), [
        ...pastTokens,
        {
          tag: "die",
          data: {
            stringToken: stringToken,
          },
        },
      ]);
    }

    const plusSignMatch = remainingInput.match(plusSign);
    if (plusSignMatch) {
      return go(remainingInput.slice(plusSignMatch[0].length), [
        ...pastTokens,
        {
          tag: "plusSign",
          data: {
            stringToken: "+",
          },
        },
      ]);
    }

    const minusSignMatch = remainingInput.match(minusSign);
    if (minusSignMatch) {
      return go(remainingInput.slice(minusSignMatch[0].length), [
        ...pastTokens,
        {
          tag: "minusSign",
          data: {
            stringToken: "-",
          },
        },
      ]);
    }

    const whitespaceMatch = remainingInput.match(whitespace);
    if (whitespaceMatch) {
      const stringToken = whitespaceMatch[0];
      return go(remainingInput.slice(stringToken.length), [
        ...pastTokens,
        {
          tag: "whitespace",
          data: {
            stringToken: stringToken,
          },
        },
      ]);
    }

    return {
      tag: "untokenizableInput",
      data: {
        inputString: inputString,
        position: inputStringLength(pastTokens),
        untokenizableRemnant: remainingInput,
      },
    };
  };
  return go(inputString, []);
};

export default tokenize;
