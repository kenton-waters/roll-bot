import {
  die,
  integer as nonnegativeInteger,
  minusSign,
  plusSign,
  whitespace,
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

    const plusSignMatch = remainingInput.match(plusSign);
    if (plusSignMatch) {
      return go(remainingInput.slice(plusSignMatch[0].length), [
        ...pastTokens,
        {
          type: "plusSign",
          stringToken: "+",
        },
      ]);
    }

    const minusSignMatch = remainingInput.match(minusSign);
    if (minusSignMatch) {
      return go(remainingInput.slice(minusSignMatch[0].length), [
        ...pastTokens,
        {
          type: "minusSign",
          stringToken: "-",
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
