import type {
  AdditionOrSubtraction,
  Atom,
  DiceRoll,
  Expression,
  Integer,
  Sign,
} from "../models/lexing-parsing/parse-tree.js";
import type ParseTree from "../models/lexing-parsing/parse-tree.js";
import type { WhitespaceToken } from "../models/lexing-parsing/token.js";

export const evaluate = (parseTree: ParseTree): number => {
  const evaluateDiceRoll = (diceRoll: DiceRoll): number => {
    const go = (numDice: number, numFaces: number): number => {
      if (numDice <= 0) return 0;

      return (
        Math.floor(Math.random() * numFaces) + 1 + go(numDice - 1, numFaces)
      );
    };

    const positiveSum = go(
      diceRoll.numDice.numericValue,
      diceRoll.positiveNumFacesToken.numericValue,
    );

    return diceRoll.sign.signValue === "-" ? -1 * positiveSum : positiveSum;
  };

  const evaluateAtom = (atom: Atom): number => {
    switch (atom.tag) {
      case "integer":
        return atom.data.numericValue;
      case "diceRoll":
        return evaluateDiceRoll(atom.data);
    }
  };

  const evaluateExpression = (expression: Expression): number => {
    switch (expression.tag) {
      case "atom":
        return evaluateAtom(expression.data);
      case "additionOrSubtraction":
        return evaluateAdditionOrSubtraction(expression.data);
    }
  };

  const evaluateAdditionOrSubtraction = (
    additionOrSubtraction: AdditionOrSubtraction,
  ): number => {
    const leftSide: number = evaluateAtom(additionOrSubtraction.leftHandAtom);
    const rightSide: number = evaluateExpression(
      additionOrSubtraction.rightHandExpression,
    );
    return additionOrSubtraction.operatorToken.stringToken === "-"
      ? leftSide - rightSide
      : leftSide + rightSide;
  };

  const evaluateSingleAtom = (atom: Atom): number => {
    switch (atom.tag) {
      case "diceRoll":
        return evaluateDiceRoll(atom.data);
      case "integer":
        // 1d20 + integer atom
        return evaluateAdditionOrSubtraction({
          leftHandAtom: {
            tag: "diceRoll",
            data: {
              sign: {
                signValue: "+",
                signToken: null,
                followingWhitespaceToken: null,
              },
              numDice: {
                nonnegativeNumDiceToken: null,
                numericValue: 1,
                followingWhitespaceToken: null,
              },
              dieSymbol: {
                dieToken: {
                  stringToken: "d",
                },
                followingWhitespaceToken: null,
              },
              positiveNumFacesToken: {
                numericValue: 20,
                stringToken: "",
              },
              followingWhitespaceToken: null,
            },
          },
          operatorToken: {
            stringToken: "+",
          },
          rightHandExpression: {
            tag: "atom",
            data: atom,
          },
          followingWhitespaceToken: null,
        });
    }
  };

  switch (parseTree.expression?.tag) {
    case "additionOrSubtraction":
      return evaluateAdditionOrSubtraction(parseTree.expression.data);
    case "atom":
      return evaluateSingleAtom(parseTree.expression.data);
    case undefined:
      // 1d20 + 0
      return evaluateSingleAtom({
        tag: "integer",
        data: {
          sign: {
            signValue: "+",
            signToken: null,
            followingWhitespaceToken: null,
          },
          numericValue: 0,
          nonnegativeIntegerToken: {
            stringToken: "",
            numericValue: 0,
          },
          followingWhitespaceToken: null,
        },
      });
  }
};

export const reconstructInputString = (parseTree: ParseTree): string => {
  const reconstructWhitespaceInputString = (
    whitespace: WhitespaceToken | null,
  ): string => {
    return whitespace?.stringToken ?? "";
  };

  const reconstructExpressionInputString = (
    expression: Expression | null,
  ): string => {
    if (expression === null) return "";

    switch (expression.tag) {
      case "additionOrSubtraction":
        return reconstructAdditionOrSubtractionInputString(expression.data);
      case "atom":
        return reconstructAtomInputString(expression.data);
    }
  };

  const reconstructAdditionOrSubtractionInputString = (
    additionOrSubtraction: AdditionOrSubtraction,
  ): string => {
    return (
      reconstructAtomInputString(additionOrSubtraction.leftHandAtom) +
      additionOrSubtraction.operatorToken.stringToken +
      reconstructWhitespaceInputString(
        additionOrSubtraction.followingWhitespaceToken,
      ) +
      reconstructExpressionInputString(
        additionOrSubtraction.rightHandExpression,
      )
    );
  };

  const reconstructAtomInputString = (atom: Atom): string => {
    switch (atom.tag) {
      case "integer":
        return reconstructIntegerInputString(atom.data);
      case "diceRoll":
        return reconstructDiceRollInputString(atom.data);
    }
  };

  const reconstructDiceRollInputString = (diceRoll: DiceRoll): string => {
    return (
      reconstructSignInputString(diceRoll.sign) +
      (diceRoll.numDice.nonnegativeNumDiceToken?.stringToken ?? "") +
      reconstructWhitespaceInputString(
        diceRoll.numDice.followingWhitespaceToken,
      ) +
      diceRoll.dieSymbol.dieToken.stringToken +
      reconstructWhitespaceInputString(
        diceRoll.dieSymbol.followingWhitespaceToken,
      ) +
      diceRoll.positiveNumFacesToken.stringToken +
      reconstructWhitespaceInputString(diceRoll.followingWhitespaceToken)
    );
  };

  const reconstructIntegerInputString = (integer: Integer): string => {
    return (
      reconstructSignInputString(integer.sign) +
      integer.nonnegativeIntegerToken.stringToken +
      reconstructWhitespaceInputString(integer.followingWhitespaceToken)
    );
  };

  const reconstructSignInputString = (sign: Sign): string => {
    return (
      (sign.signToken?.stringToken ?? "") +
      reconstructWhitespaceInputString(sign.followingWhitespaceToken)
    );
  };

  return (
    reconstructWhitespaceInputString(parseTree.initialWhitespaceToken) +
    reconstructExpressionInputString(parseTree.expression)
  );
};
