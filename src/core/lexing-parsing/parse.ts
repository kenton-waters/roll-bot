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

  switch (parseTreeResult.type) {
    case "failure":
      logger.warn(parseTreeResult);
      return parseTreeResult;

    case "success": {
      if (parseTreeResult.remainingTokens.length === 0) return parseTreeResult;
      const notExhausted: ParseResult<ParseTree> = {
        type: "failure",
        reason: "Parsing did not exhaust tokens.",
        remainingTokens: parseTreeResult.remainingTokens,
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
  switch (parseExpressionResult.type) {
    case "failure":
      return {
        type: "success",
        parsedObject: {
          initialWhitespaceToken,
          expression: null,
        },
        remainingTokens: parseExpressionResult.remainingTokens,
      };
    case "success":
      return {
        type: "success",
        parsedObject: {
          initialWhitespaceToken,
          expression: parseExpressionResult.parsedObject,
        },
        remainingTokens: parseExpressionResult.remainingTokens,
      };
  }
};

const parseOptionalWhitespace = (
  tokens: Token[],
): ParseSuccess<WhitespaceToken | null> => {
  if (tokens[0]?.type !== "whitespace") {
    return {
      parsedObject: null,
      remainingTokens: tokens,
    };
  }

  return {
    parsedObject: tokens[0],
    remainingTokens: tokens.slice(1),
  };
};

const parseExpression = (tokens: Token[]): ParseResult<Expression> => {
  const parseAdditionOrSubtractionResult = parseAdditionOrSubtraction(tokens);
  if (parseAdditionOrSubtractionResult.type === "success")
    return {
      type: "success",
      parsedObject: {
        type: "additionOrSubtraction",
        ...parseAdditionOrSubtractionResult.parsedObject,
      },
      remainingTokens: parseAdditionOrSubtractionResult.remainingTokens,
    };

  const parseAtomResult = parseAtom(tokens);
  switch (parseAtomResult.type) {
    case "failure":
      return parseAtomResult;
    case "success":
      return {
        type: "success",
        parsedObject: {
          type: "atom",
          data: parseAtomResult.parsedObject,
        },
        remainingTokens: parseAtomResult.remainingTokens,
      };
  }
};

const parseAdditionOrSubtraction = (
  tokens: Token[],
): ParseResult<AdditionOrSubtraction> => {
  const parseLeftHandAtomResult = parseAtom(tokens);

  if (parseLeftHandAtomResult.type !== "success")
    return parseLeftHandAtomResult;

  const {
    parsedObject: leftHandAtom,
    remainingTokens: postLeftHandAtomTokens,
  } = parseLeftHandAtomResult;

  const nextToken = postLeftHandAtomTokens[0];
  if (nextToken?.type !== "plusSign" && nextToken?.type !== "minusSign")
    return {
      type: "failure",
      reason:
        "Expected '+' or '-' not found while parsing addition or subtraction expression.",
      remainingTokens: postLeftHandAtomTokens,
    };

  const operatorToken = nextToken;

  const {
    parsedObject: postOperatorWhitespaceToken,
    remainingTokens: postOperatorTokens,
  } = parseOptionalWhitespace(postLeftHandAtomTokens.slice(1));

  const parseRightHandExpressionResult = parseExpression(postOperatorTokens);
  if (parseRightHandExpressionResult.type !== "success")
    return parseRightHandExpressionResult;

  return {
    type: "success",
    parsedObject: {
      leftHandAtom,
      operatorToken,
      followingWhitespaceToken: postOperatorWhitespaceToken,
      rightHandExpression: parseRightHandExpressionResult.parsedObject,
    },
    remainingTokens: parseRightHandExpressionResult.remainingTokens,
  };
};

const parseAtom = (tokens: Token[]): ParseResult<Atom> => {
  const parseDiceRollResult = parseDiceRoll(tokens);
  if (parseDiceRollResult.type === "success")
    return {
      type: "success",
      parsedObject: {
        type: "diceRoll",
        ...parseDiceRollResult.parsedObject,
      },
      remainingTokens: parseDiceRollResult.remainingTokens,
    };

  const parseIntegerResult = parseInteger(tokens);
  switch (parseIntegerResult.type) {
    case "failure":
      return parseIntegerResult;
    case "success":
      return {
        type: "success",
        parsedObject: {
          type: "integer",
          ...parseIntegerResult.parsedObject,
        },
        remainingTokens: parseIntegerResult.remainingTokens,
      };
  }
};

const parseDiceRoll = (tokens: Token[]): ParseResult<DiceRoll> => {
  const { parsedObject: sign, remainingTokens: postSignTokens } =
    parseSign(tokens);

  const { parsedObject: numDice, remainingTokens: postNumDiceTokens } =
    parseNumDice(postSignTokens);

  const nextToken = postNumDiceTokens[0];
  if (nextToken?.type !== "die")
    return {
      type: "failure",
      reason: "Expected 'd' or 'D' not found when parsing diceRoll atom.",
      remainingTokens: postNumDiceTokens,
    };

  const dieToken = nextToken;
  const {
    parsedObject: postDieTokenWhitespaceToken,
    remainingTokens: postDieTokenTokens,
  } = parseOptionalWhitespace(postNumDiceTokens.slice(1));

  const postDieToken = postDieTokenTokens[0];
  if (postDieToken?.type !== "nonnegativeInteger")
    return {
      type: "failure",
      reason:
        "Expected nonnegative integer not found when parsing diceRoll's number of faces.",
      remainingTokens: postDieTokenTokens,
    };

  const positiveNumFacesToken = postDieToken;
  if (positiveNumFacesToken.numericValue < 1)
    return {
      type: "failure",
      reason: "Number of faces on a die may not be less than 1.",
      remainingTokens: postDieTokenTokens,
    };

  const {
    parsedObject: postNumFacesWhitespaceToken,
    remainingTokens: postNumFacesTokens,
  } = parseOptionalWhitespace(postDieTokenTokens.slice(1));

  return {
    type: "success",
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
  };
};

const parseNumDice = (tokens: Token[]): ParseSuccess<NumDice> => {
  const firstToken = tokens[0];
  if (firstToken?.type !== "nonnegativeInteger")
    return {
      parsedObject: {
        numericValue: 1,
        nonnegativeNumDiceToken: null,
        followingWhitespaceToken: null,
      },
      remainingTokens: tokens,
    };

  const nonnegativeIntegerToken = firstToken;

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
  if (nextToken?.type !== "nonnegativeInteger")
    return {
      type: "failure",
      reason:
        "Expected nonnegative integer token not found when parsing integer atom.",
      remainingTokens: postSignTokens,
    };

  const nonnegativeIntegerToken = nextToken;

  const { parsedObject: whitespaceToken, remainingTokens } =
    parseOptionalWhitespace(postSignTokens.slice(1));

  return {
    type: "success",
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
  };
};

const parseSign = (tokens: Token[]): ParseSuccess<Sign> => {
  const firstToken = tokens[0];
  if (firstToken?.type !== "minusSign" && firstToken?.type !== "plusSign")
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
      signValue: signToken.stringToken,
      signToken: signToken,
      followingWhitespaceToken: whitespaceToken,
    },
    remainingTokens: remainingTokens,
  };
};
