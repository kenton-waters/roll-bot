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

    return {
      tag: "unexpectedCharacter",
      data: {
        character: inputString[0] ?? "undefined",
        position: 0,
      },
    };
  };
  return go(inputString, []);
};

export default tokenize;
