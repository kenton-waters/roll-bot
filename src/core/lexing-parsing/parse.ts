import type Token from "../../models/lexing-parsing/token.js";
import type Logger from "../../models/logger.js";
import type ParseResult from "../../models/results/parse-result.js";

interface ParseParams {
  readonly tokens: Token[];
  readonly deps: {
    prevLogger: Logger;
  };
}
const parse = ({ tokens, deps: { prevLogger } }: ParseParams): ParseResult => {
  prevLogger.logWithNew("parse", "Parsing tokens:", tokens);
  return {
    tag: "unparseableInput",
    data: {
      message: "Consecutive integers are not allowed.",
      parsedInput: " 010 ",
      failurePosition: 5,
      unparseableRemnant: "050 ",
    },
  };
};

export default parse;
