import { die, integer } from "../../../constants/regular-expressions.js";
import type Token from "../../../models/lexing-parsing/lexing/token.js";
import type Logger from "../../../models/logger.js";
import type TokenizeResult from "../../../models/results/tokenize-result.js";

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
  prevLogger.logWithNew("tokenize", "Tokenizing input string:", inputString);

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

    return {
      tag: "unexpectedCharacter",
      data: {
        character: remainingInput[0] ?? "undefined",
        position: pastTokens.reduce(
          (acc, curr) => acc + curr.data.stringToken.length,
          0,
        ),
      },
    };
  };
  return go(inputString, []);
};

export default tokenize;
