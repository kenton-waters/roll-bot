import type {
  AdditionOrSubtraction,
  Atom,
  DiceRoll,
  Expression,
  Integer,
  LeftHandTerm,
  Parenthetical,
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
    switch (atom.type) {
      case "integer":
        return atom.numericValue;
      case "diceRoll":
        return evaluateDiceRoll(atom);
    }
  };

  const evaluateExpression = (expression: Expression): number => {
    switch (expression.type) {
      case "atom":
        return evaluateAtom(expression.data);
      case "additionOrSubtraction":
        return evaluateAdditionOrSubtraction(expression);
      case "parenthetical": {
        return evaluateExpression(expression.internalExpression);
      }
    }
  };

  const evaluateLeftHandTerm = (leftHandTerm: LeftHandTerm): number => {
    switch (leftHandTerm.type) {
      case "atom":
        return evaluateAtom(leftHandTerm.data);
      case "parenthetical":
        return evaluateExpression(leftHandTerm.internalExpression);
    }
  };

  const evaluateAdditionOrSubtraction = (
    additionOrSubtraction: AdditionOrSubtraction,
  ): number => {
    const leftSide: number = evaluateLeftHandTerm(
      additionOrSubtraction.leftHandTerm,
    );
    const rightSide: number = evaluateExpression(
      additionOrSubtraction.rightHandExpression,
    );
    return additionOrSubtraction.operatorToken.stringToken === "-"
      ? leftSide - rightSide
      : leftSide + rightSide;
  };

  const evaluateSingleAtom = (atom: Atom): number => {
    switch (atom.type) {
      case "diceRoll":
        return evaluateDiceRoll(atom);
      case "integer":
        // 1d20 + integer atom
        return evaluateAdditionOrSubtraction({
          leftHandTerm: {
            type: "atom",
            data: {
              type: "diceRoll",
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
            type: "atom",
            data: atom,
          },
          followingWhitespaceToken: null,
        });
    }
  };

  switch (parseTree.expression?.type) {
    case "additionOrSubtraction":
      return evaluateAdditionOrSubtraction(parseTree.expression);
    case "atom":
      return evaluateSingleAtom(parseTree.expression.data);
    case "parenthetical":
      return evaluateExpression(parseTree.expression.internalExpression);
    case undefined:
      // 1d20 + 0
      return evaluateSingleAtom({
        type: "integer",
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

    switch (expression.type) {
      case "additionOrSubtraction":
        return reconstructAdditionOrSubtractionInputString(expression);
      case "atom":
        return reconstructAtomInputString(expression.data);
      case "parenthetical": {
        return reconstructParentheticalInputString(expression);
      }
    }
  };

  const reconstructParentheticalInputString = (
    parenthetical: Parenthetical,
  ): string => {
    return (
      parenthetical.leftParen.leftParenToken.stringToken +
      reconstructWhitespaceInputString(
        parenthetical.leftParen.followingWhitespaceToken,
      ) +
      reconstructExpressionInputString(parenthetical.internalExpression) +
      parenthetical.rightParen.rightParenToken.stringToken +
      reconstructWhitespaceInputString(
        parenthetical.rightParen.followingWhitespaceToken,
      )
    );
  };

  const reconstructLeftHandTermInputString = (
    leftHandTerm: LeftHandTerm,
  ): string => {
    switch (leftHandTerm.type) {
      case "atom":
        return reconstructAtomInputString(leftHandTerm.data);
      case "parenthetical":
        return reconstructParentheticalInputString(leftHandTerm);
    }
  };

  const reconstructAdditionOrSubtractionInputString = (
    additionOrSubtraction: AdditionOrSubtraction,
  ): string => {
    return (
      reconstructLeftHandTermInputString(additionOrSubtraction.leftHandTerm) +
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
    switch (atom.type) {
      case "integer":
        return reconstructIntegerInputString(atom);
      case "diceRoll":
        return reconstructDiceRollInputString(atom);
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
