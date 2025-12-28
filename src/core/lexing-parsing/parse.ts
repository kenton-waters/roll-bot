import type {
  Atom,
  Expression,
  Integer,
  Sign,
} from "../../models/lexing-parsing/parse-tree.js";
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
  const {
    parsedObject: initialWhitespaceToken,
    remainingTokens: postInitialWhitespaceTokens,
  } = parseOptionalWhitespace(tokens);
  const parseExpressionResult = parseExpression(postInitialWhitespaceTokens);
  switch (parseExpressionResult.tag) {
    case "failure":
      return {
        tag: "success",
        data: {
          parsedObject: {
            initialWhitespaceToken,
            expression: null,
          },
          remainingTokens: parseExpressionResult.data.remainingTokens,
        },
      };
    case "success":
      return {
        tag: "success",
        data: {
          parsedObject: {
            initialWhitespaceToken,
            expression: parseExpressionResult.data.parsedObject,
          },
          remainingTokens: parseExpressionResult.data.remainingTokens,
        },
      };
  }
};

const parseOptionalWhitespace = (
  tokens: Token[],
): ParseSuccess<WhitespaceToken | null> => {
  if (tokens[0]?.tag !== "whitespace") {
    return {
      parsedObject: null,
      remainingTokens: tokens,
    };
  }

  return {
    parsedObject: tokens[0].data,
    remainingTokens: tokens.slice(1),
  };
};

const parseExpression = (tokens: Token[]): ParseResult<Expression> => {
  const parseAtomResult = parseAtom(tokens);
  switch (parseAtomResult.tag) {
    case "failure":
      return parseAtomResult;
    case "success":
      return {
        tag: "success",
        data: {
          parsedObject: {
            tag: "atom",
            data: parseAtomResult.data.parsedObject,
          },
          remainingTokens: parseAtomResult.data.remainingTokens,
        },
      };
  }
};

const parseAtom = (tokens: Token[]): ParseResult<Atom> => {
  const parseIntegerResult = parseInteger(tokens);
  switch (parseIntegerResult.tag) {
    case "failure":
      return parseIntegerResult;
    case "success":
      return {
        tag: "success",
        data: {
          parsedObject: {
            tag: "integer",
            data: parseIntegerResult.data.parsedObject,
          },
          remainingTokens: parseIntegerResult.data.remainingTokens,
        },
      };
  }
};

const parseInteger = (tokens: Token[]): ParseResult<Integer> => {
  const { parsedObject: sign, remainingTokens: postSignTokens } =
    parseSign(tokens);
  if (postSignTokens[0]?.tag !== "nonnegativeInteger")
    return {
      tag: "failure",
      data: {
        reason: "TODO",
        remainingTokens: postSignTokens,
      },
    };

  const nonnegativeIntegerToken = postSignTokens[0].data;

  return {
    tag: "success",
    data: {
      parsedObject: {
        sign: sign,
        numericValue:
          sign.signValue === "-"
            ? -1 * nonnegativeIntegerToken.numericValue
            : nonnegativeIntegerToken.numericValue,
        nonnegativeIntegerToken: nonnegativeIntegerToken,
        followingWhitespaceToken: null,
      },
      remainingTokens: postSignTokens.slice(1),
    },
  };
};

const parseSign = (tokens: Token[]): ParseSuccess<Sign> => {
  if (tokens[0]?.tag !== "minusSign" && tokens[0]?.tag !== "plusSign")
    return {
      parsedObject: {
        signValue: "+",
        signToken: null,
        followingWhitespaceToken: null,
      },
      remainingTokens: tokens,
    };

  return {
    parsedObject: {
      signValue: tokens[0].data.stringToken,
      signToken: tokens[0].data,
      followingWhitespaceToken: null,
    },
    remainingTokens: tokens.slice(1),
  };
};
