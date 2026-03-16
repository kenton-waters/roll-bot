import type {
  AdditionOrSubtraction,
  Atom,
  DiceRoll,
  Expression,
  Integer,
  NumDice,
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
  const logger = prevLogger.logWithNew("parse", "Parsing tokens:", tokens);

  const parseTreeResult = parseTree(tokens);

  switch (parseTreeResult.tag) {
    case "failure":
      logger.warn(parseTreeResult);
      return parseTreeResult;

    case "success": {
      if (parseTreeResult.payload.remainingTokens.length === 0)
        return parseTreeResult;
      const notExhausted: ParseResult<ParseTree> = {
        tag: "failure",
        payload: {
          reason: "Parsing did not exhaust tokens.",
          remainingTokens: parseTreeResult.payload.remainingTokens,
        },
      };
      logger.warn(notExhausted);
      return notExhausted;
    }
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
        payload: {
          parsedObject: {
            initialWhitespaceToken,
            expression: null,
          },
          remainingTokens: parseExpressionResult.payload.remainingTokens,
        },
      };
    case "success":
      return {
        tag: "success",
        payload: {
          parsedObject: {
            initialWhitespaceToken,
            expression: parseExpressionResult.payload.parsedObject,
          },
          remainingTokens: parseExpressionResult.payload.remainingTokens,
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
    parsedObject: tokens[0].payload,
    remainingTokens: tokens.slice(1),
  };
};

const parseExpression = (tokens: Token[]): ParseResult<Expression> => {
  const parseAdditionOrSubtractionResult = parseAdditionOrSubtraction(tokens);
  if (parseAdditionOrSubtractionResult.tag === "success")
    return {
      tag: "success",
      payload: {
        parsedObject: {
          tag: "additionOrSubtraction",
          payload: parseAdditionOrSubtractionResult.payload.parsedObject,
        },
        remainingTokens:
          parseAdditionOrSubtractionResult.payload.remainingTokens,
      },
    };

  const parseAtomResult = parseAtom(tokens);
  switch (parseAtomResult.tag) {
    case "failure":
      return parseAtomResult;
    case "success":
      return {
        tag: "success",
        payload: {
          parsedObject: {
            tag: "atom",
            payload: parseAtomResult.payload.parsedObject,
          },
          remainingTokens: parseAtomResult.payload.remainingTokens,
        },
      };
  }
};

const parseAdditionOrSubtraction = (
  tokens: Token[],
): ParseResult<AdditionOrSubtraction> => {
  const parseLeftHandAtomResult = parseAtom(tokens);

  if (parseLeftHandAtomResult.tag !== "success") return parseLeftHandAtomResult;

  const {
    parsedObject: leftHandAtom,
    remainingTokens: postLeftHandAtomTokens,
  } = parseLeftHandAtomResult.payload;

  const nextToken = postLeftHandAtomTokens[0];
  if (nextToken?.tag !== "plusSign" && nextToken?.tag !== "minusSign")
    return {
      tag: "failure",
      payload: {
        reason:
          "Expected '+' or '-' not found while parsing addition or subtraction expression.",
        remainingTokens: postLeftHandAtomTokens,
      },
    };

  const operatorToken = nextToken.payload;

  const {
    parsedObject: postOperatorWhitespaceToken,
    remainingTokens: postOperatorTokens,
  } = parseOptionalWhitespace(postLeftHandAtomTokens.slice(1));

  const parseRightHandExpressionResult = parseExpression(postOperatorTokens);
  if (parseRightHandExpressionResult.tag !== "success")
    return parseRightHandExpressionResult;

  return {
    tag: "success",
    payload: {
      parsedObject: {
        leftHandAtom,
        operatorToken,
        followingWhitespaceToken: postOperatorWhitespaceToken,
        rightHandExpression:
          parseRightHandExpressionResult.payload.parsedObject,
      },
      remainingTokens: parseRightHandExpressionResult.payload.remainingTokens,
    },
  };
};

const parseAtom = (tokens: Token[]): ParseResult<Atom> => {
  const parseDiceRollResult = parseDiceRoll(tokens);
  if (parseDiceRollResult.tag === "success")
    return {
      tag: "success",
      payload: {
        parsedObject: {
          tag: "diceRoll",
          payload: parseDiceRollResult.payload.parsedObject,
        },
        remainingTokens: parseDiceRollResult.payload.remainingTokens,
      },
    };

  const parseIntegerResult = parseInteger(tokens);
  switch (parseIntegerResult.tag) {
    case "failure":
      return parseIntegerResult;
    case "success":
      return {
        tag: "success",
        payload: {
          parsedObject: {
            tag: "integer",
            payload: parseIntegerResult.payload.parsedObject,
          },
          remainingTokens: parseIntegerResult.payload.remainingTokens,
        },
      };
  }
};

const parseDiceRoll = (tokens: Token[]): ParseResult<DiceRoll> => {
  const { parsedObject: sign, remainingTokens: postSignTokens } =
    parseSign(tokens);

  const { parsedObject: numDice, remainingTokens: postNumDiceTokens } =
    parseNumDice(postSignTokens);

  const nextToken = postNumDiceTokens[0];
  if (nextToken?.tag !== "die")
    return {
      tag: "failure",
      payload: {
        reason: "Expected 'd' or 'D' not found when parsing diceRoll atom.",
        remainingTokens: postNumDiceTokens,
      },
    };

  const dieToken = nextToken.payload;
  const {
    parsedObject: postDieTokenWhitespaceToken,
    remainingTokens: postDieTokenTokens,
  } = parseOptionalWhitespace(postNumDiceTokens.slice(1));

  const postDieToken = postDieTokenTokens[0];
  if (postDieToken?.tag !== "nonnegativeInteger")
    return {
      tag: "failure",
      payload: {
        reason:
          "Expected nonnegative integer not found when parsing diceRoll's number of faces.",
        remainingTokens: postDieTokenTokens,
      },
    };

  const positiveNumFacesToken = postDieToken.payload;
  if (positiveNumFacesToken.numericValue < 1)
    return {
      tag: "failure",
      payload: {
        reason: "Number of faces on a die may not be less than 1.",
        remainingTokens: postDieTokenTokens,
      },
    };

  const {
    parsedObject: postNumFacesWhitespaceToken,
    remainingTokens: postNumFacesTokens,
  } = parseOptionalWhitespace(postDieTokenTokens.slice(1));

  return {
    tag: "success",
    payload: {
      parsedObject: {
        sign,
        numDice,
        dieSymbol: {
          dieToken,
          followingWhitespaceToken: postDieTokenWhitespaceToken,
        },
        positiveNumFacesToken,
        followingWhitespaceToken: postNumFacesWhitespaceToken,
      },
      remainingTokens: postNumFacesTokens,
    },
  };
};

const parseNumDice = (tokens: Token[]): ParseSuccess<NumDice> => {
  const firstToken = tokens[0];
  if (firstToken?.tag !== "nonnegativeInteger")
    return {
      parsedObject: {
        numericValue: 1,
        nonnegativeNumDiceToken: null,
        followingWhitespaceToken: null,
      },
      remainingTokens: tokens,
    };

  const nonnegativeIntegerToken = firstToken.payload;

  const { parsedObject: whitespaceToken, remainingTokens } =
    parseOptionalWhitespace(tokens.slice(1));

  return {
    parsedObject: {
      numericValue: nonnegativeIntegerToken.numericValue,
      nonnegativeNumDiceToken: nonnegativeIntegerToken,
      followingWhitespaceToken: whitespaceToken,
    },
    remainingTokens,
  };
};

const parseInteger = (tokens: Token[]): ParseResult<Integer> => {
  const { parsedObject: sign, remainingTokens: postSignTokens } =
    parseSign(tokens);

  const nextToken = postSignTokens[0];
  if (nextToken?.tag !== "nonnegativeInteger")
    return {
      tag: "failure",
      payload: {
        reason:
          "Expected nonnegative integer token not found when parsing integer atom.",
        remainingTokens: postSignTokens,
      },
    };

  const nonnegativeIntegerToken = nextToken.payload;

  const { parsedObject: whitespaceToken, remainingTokens } =
    parseOptionalWhitespace(postSignTokens.slice(1));

  return {
    tag: "success",
    payload: {
      parsedObject: {
        sign: sign,
        numericValue:
          sign.signValue === "-"
            ? -1 * nonnegativeIntegerToken.numericValue
            : nonnegativeIntegerToken.numericValue,
        nonnegativeIntegerToken: nonnegativeIntegerToken,
        followingWhitespaceToken: whitespaceToken,
      },
      remainingTokens: remainingTokens,
    },
  };
};

const parseSign = (tokens: Token[]): ParseSuccess<Sign> => {
  const firstToken = tokens[0];
  if (firstToken?.tag !== "minusSign" && firstToken?.tag !== "plusSign")
    return {
      parsedObject: {
        signValue: "+",
        signToken: null,
        followingWhitespaceToken: null,
      },
      remainingTokens: tokens,
    };

  const signToken = firstToken;

  const { parsedObject: whitespaceToken, remainingTokens } =
    parseOptionalWhitespace(tokens.slice(1));

  return {
    parsedObject: {
      signValue: signToken.payload.stringToken,
      signToken: signToken.payload,
      followingWhitespaceToken: whitespaceToken,
    },
    remainingTokens: remainingTokens,
  };
};
