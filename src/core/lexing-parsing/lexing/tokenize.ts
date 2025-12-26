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
  return {
    tag: "unexpectedCharacter",
    data: {
      character: inputString[0] ?? "",
      position: 0,
    },
  };
};

export default tokenize;
