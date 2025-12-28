import type ParseTree from "../../models/lexing-parsing/parse-tree.js";
import type { WhitespaceToken } from "../../models/lexing-parsing/token.js";
import type Token from "../../models/lexing-parsing/token.js";
import type Logger from "../../models/logger.js";
import type { ParseSuccess } from "../../models/results/parse-result.js";
import type ParseResult from "../../models/results/parse-result.js";

interface ParseParams {
  readonly tokens: Token[];
  readonly deps: {
    prevLogger: Logger;
  };
}
const parse = ({
  tokens,
  deps: { prevLogger },
}: ParseParams): ParseResult<ParseTree> => {
  prevLogger.logWithNew("parse", "Parsing tokens:", tokens);

  const parseTreeResult = parseTree(tokens);

  switch (parseTreeResult.tag) {
    case "failure":
      return parseTreeResult;

    case "success":
      if (parseTreeResult.data.remainingTokens.length === 0)
        return parseTreeResult;
      return {
        tag: "failure",
        data: {
          reason: "Parsing did not exhaust tokens.",
          remainingTokens: parseTreeResult.data.remainingTokens,
        },
      };
  }
};

export default parse;

const parseTree = (tokens: Token[]): ParseResult<ParseTree> => {
  const { parsedObject: initialWhitespaceToken, remainingTokens } =
    parseOptionalWhitespace(tokens);
  return {
    tag: "success",
    data: {
      parsedObject: {
        initialWhitespaceToken,
        expression: null,
      },
      remainingTokens,
    },
  };
};

function parseOptionalWhitespace(
  tokens: Token[],
): ParseSuccess<WhitespaceToken | null> {
  if (tokens.length === 0 || tokens[0]?.tag !== "whitespace") {
    return {
      parsedObject: null,
      remainingTokens: tokens,
    };
  }

  return {
    parsedObject: tokens[0].data,
    remainingTokens: tokens.slice(1),
  };
}
