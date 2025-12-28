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
  const parseAdditionOrSubtractionResult = parseAdditionOrSubtraction(tokens);
  if (parseAdditionOrSubtractionResult.tag === "success")
    return {
      tag: "success",
      data: {
        parsedObject: {
          tag: "additionOrSubtraction",
          data: parseAdditionOrSubtractionResult.data.parsedObject,
        },
        remainingTokens: parseAdditionOrSubtractionResult.data.remainingTokens,
      },
    };

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

const parseAdditionOrSubtraction = (
  tokens: Token[],
): ParseResult<AdditionOrSubtraction> => {
  const parseLeftHandAtomResult = parseAtom(tokens);

  if (parseLeftHandAtomResult.tag !== "success") return parseLeftHandAtomResult;

  const {
    parsedObject: leftHandAtom,
    remainingTokens: postLeftHandAtomTokens,
  } = parseLeftHandAtomResult.data;

  const nextToken = postLeftHandAtomTokens[0];
  if (nextToken?.tag !== "plusSign" && nextToken?.tag !== "minusSign")
    return {
      tag: "failure",
      data: {
        reason:
          "Expected '+' or '-' not found while parsing addition or subtraction expression.",
        remainingTokens: postLeftHandAtomTokens,
      },
    };

  const operatorToken = nextToken.data;

  const {
    parsedObject: postOperatorWhitespaceToken,
    remainingTokens: postOperatorTokens,
  } = parseOptionalWhitespace(postLeftHandAtomTokens.slice(1));

  const parseRightHandExpressionResult = parseExpression(postOperatorTokens);
  if (parseRightHandExpressionResult.tag !== "success")
    return parseRightHandExpressionResult;

  return {
    tag: "success",
    data: {
      parsedObject: {
        leftHandAtom,
        operatorToken,
        followingWhitespaceToken: postOperatorWhitespaceToken,
        rightHandExpression: parseRightHandExpressionResult.data.parsedObject,
      },
      remainingTokens: parseRightHandExpressionResult.data.remainingTokens,
    },
  };
};

const parseAtom = (tokens: Token[]): ParseResult<Atom> => {
  const parseDiceRollResult = parseDiceRoll(tokens);
  if (parseDiceRollResult.tag === "success")
    return {
      tag: "success",
      data: {
        parsedObject: {
          tag: "diceRoll",
          data: parseDiceRollResult.data.parsedObject,
        },
        remainingTokens: parseDiceRollResult.data.remainingTokens,
      },
    };

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

const parseDiceRoll = (tokens: Token[]): ParseResult<DiceRoll> => {
  const { parsedObject: sign, remainingTokens: postSignTokens } =
    parseSign(tokens);

  const { parsedObject: numDice, remainingTokens: postNumDiceTokens } =
    parseNumDice(postSignTokens);

  const nextToken = postNumDiceTokens[0];
  if (nextToken?.tag !== "die")
    return {
      tag: "failure",
      data: {
        reason: "Expected 'd' or 'D' not found when parsing diceRoll atom.",
        remainingTokens: postNumDiceTokens,
      },
    };

  const dieToken = nextToken.data;
  const {
    parsedObject: postDieTokenWhitespaceToken,
    remainingTokens: postDieTokenTokens,
  } = parseOptionalWhitespace(postNumDiceTokens.slice(1));

  const postDieToken = postDieTokenTokens[0];
  if (postDieToken?.tag !== "nonnegativeInteger")
    return {
      tag: "failure",
      data: {
        reason:
          "Expected nonnegative integer not found when parsing diceRoll's number of faces.",
        remainingTokens: postDieTokenTokens,
      },
    };

  const positiveNumFacesToken = postDieToken.data;
  if (positiveNumFacesToken.numericValue < 1)
    return {
      tag: "failure",
      data: {
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
    data: {
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

  const nonnegativeIntegerToken = firstToken.data;

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
      data: {
        reason:
          "Expected nonnegative integer token not found when parsing integer atom.",
        remainingTokens: postSignTokens,
      },
    };

  const nonnegativeIntegerToken = nextToken.data;

  const { parsedObject: whitespaceToken, remainingTokens } =
    parseOptionalWhitespace(postSignTokens.slice(1));

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
      signValue: signToken.data.stringToken,
      signToken: signToken.data,
      followingWhitespaceToken: whitespaceToken,
    },
    remainingTokens: remainingTokens,
  };
};
