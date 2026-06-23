import type {
  AdditionOrSubtraction,
  Atom,
  DiceRoll,
  Expression,
  Integer,
  AdditiveTerm,
  Parenthetical,
  Sign,
  MultiplicationOrDivision,
  ExplicitMultiplicationOrDivision,
  MultiplicativeTerm,
  ImplicitMultiplication,
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

  const evaluateMultiplicativeTerm = (
    multiplicativeTerm: MultiplicativeTerm,
  ): number => {
    switch (multiplicativeTerm.type) {
      case "atom":
        return evaluateAtom(multiplicativeTerm.data);
      case "parenthetical":
        return evaluateExpression(multiplicativeTerm.internalExpression);
    }
  };

  const evaluateExplicitMultiplicationOrDivision = (
    explicitMultiplicationOrDivision: ExplicitMultiplicationOrDivision,
  ): number => {
    const leftHandValue: number =
      explicitMultiplicationOrDivision.leftHandExpression.type ===
      "multiplicationOrDivision"
        ? evaluateMultiplicationOrDivision(
            explicitMultiplicationOrDivision.leftHandExpression.data,
          )
        : evaluateMultiplicativeTerm(
            explicitMultiplicationOrDivision.leftHandExpression.data,
          );
    const rightHandValue: number = evaluateMultiplicativeTerm(
      explicitMultiplicationOrDivision.rightHandTerm,
    );

    switch (explicitMultiplicationOrDivision.operatorToken.stringToken) {
      case "*":
        return leftHandValue * rightHandValue;
      case "/":
        return leftHandValue / rightHandValue;
    }
  };

  const evaluateImplicitMultiplication = (
    implicitMultiplication: ImplicitMultiplication,
  ): number => {
    const leftHandValue: number =
      implicitMultiplication.type === "implicitMultiplicationLeft"
        ? evaluateExpression(
            implicitMultiplication.leftHandParenthetical.internalExpression,
          )
        : evaluateMultiplicativeTerm(implicitMultiplication.leftHandTerm);
    const rightHandValue: number =
      implicitMultiplication.type === "implicitMultiplicationLeft"
        ? evaluateMultiplicativeTerm(implicitMultiplication.rightHandTerm)
        : evaluateExpression(
            implicitMultiplication.rightHandParenthetical.internalExpression,
          );
    return leftHandValue * rightHandValue;
  };

  const evaluateMultiplicationOrDivision = (
    multiplicationOrDivision: MultiplicationOrDivision,
  ): number => {
    switch (multiplicationOrDivision.type) {
      case "explicitMultiplicationOrDivision":
        return evaluateExplicitMultiplicationOrDivision(
          multiplicationOrDivision,
        );
      case "implicitMultiplication":
        return evaluateImplicitMultiplication(multiplicationOrDivision.data);
    }
  };

  const evaluateExpression = (expression: Expression): number => {
    switch (expression.type) {
      case "atom":
        return evaluateAtom(expression.data);
      case "additionOrSubtraction":
        return evaluateAdditionOrSubtraction(expression);
      case "parenthetical":
        return evaluateExpression(expression.internalExpression);
      case "multiplicationOrDivision":
        return evaluateMultiplicationOrDivision(expression.data);
    }
  };

  const evaluateAdditiveTerm = (additiveTerm: AdditiveTerm): number => {
    switch (additiveTerm.type) {
      case "atom":
        return evaluateAtom(additiveTerm.data);
      case "parenthetical":
        return evaluateExpression(additiveTerm.internalExpression);
      case "multiplicationOrDivision":
        return evaluateMultiplicationOrDivision(additiveTerm.data);
    }
  };

  const evaluateAdditionOrSubtraction = (
    additionOrSubtraction: AdditionOrSubtraction,
  ): number => {
    const leftSide: number = (() => {
      switch (additionOrSubtraction.leftHandExpression.type) {
        case "additionOrSubtraction":
          return evaluateAdditionOrSubtraction(
            additionOrSubtraction.leftHandExpression,
          );
        case "firstAdditiveTerm":
          return evaluateAdditiveTerm(
            additionOrSubtraction.leftHandExpression.data,
          );
      }
    })();
    const rightSide: number = evaluateAdditiveTerm(
      additionOrSubtraction.rightHandTerm,
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
          leftHandExpression: {
            type: "firstAdditiveTerm",
            data: {
              type: "atom",
              data: atom,
            },
          },
          operatorToken: {
            stringToken: "+",
          },
          followingWhitespaceToken: null,
          rightHandTerm: {
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
    case "multiplicationOrDivision":
      return evaluateMultiplicationOrDivision(parseTree.expression.data);
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
      case "parenthetical":
        return reconstructParentheticalInputString(expression);
      case "multiplicationOrDivision":
        return reconstructMultiplicationOrDivisionInputString(expression.data);
    }
  };

  const reconstructMultiplicationOrDivisionInputString = (
    multiplicationOrDivision: MultiplicationOrDivision,
  ): string => {
    switch (multiplicationOrDivision.type) {
      case "explicitMultiplicationOrDivision":
        return reconstructExplicitMultiplicationOrDivisionInputString(
          multiplicationOrDivision,
        );
      case "implicitMultiplication":
        return reconstructImplicitMultiplicationInputString(
          multiplicationOrDivision.data,
        );
    }
  };

  const reconstructImplicitMultiplicationInputString = (
    implicitMultiplication: ImplicitMultiplication,
  ): string => {
    switch (implicitMultiplication.type) {
      case "implicitMultiplicationLeft":
        return (
          reconstructParentheticalInputString(
            implicitMultiplication.leftHandParenthetical,
          ) +
          reconstructMultiplicativeTermInputString(
            implicitMultiplication.rightHandTerm,
          )
        );
      case "implicitMultiplicationRight":
        return (
          reconstructMultiplicativeTermInputString(
            implicitMultiplication.leftHandTerm,
          ) +
          reconstructParentheticalInputString(
            implicitMultiplication.rightHandParenthetical,
          )
        );
    }
  };

  const reconstructExplicitMultiplicationOrDivisionInputString = (
    explicitMultiplicationOrDivision: ExplicitMultiplicationOrDivision,
  ): string => {
    const leftSide: string = (() => {
      switch (explicitMultiplicationOrDivision.leftHandExpression.type) {
        case "multiplicationOrDivision":
          return reconstructMultiplicationOrDivisionInputString(
            explicitMultiplicationOrDivision.leftHandExpression.data,
          );
        case "firstMultiplicativeTerm":
          return reconstructMultiplicativeTermInputString(
            explicitMultiplicationOrDivision.leftHandExpression.data,
          );
      }
    })();
    return (
      leftSide +
      explicitMultiplicationOrDivision.operatorToken.stringToken +
      reconstructWhitespaceInputString(
        explicitMultiplicationOrDivision.followingWhitespaceToken,
      ) +
      reconstructMultiplicativeTermInputString(
        explicitMultiplicationOrDivision.rightHandTerm,
      )
    );
  };

  const reconstructMultiplicativeTermInputString = (
    multiplicativeTerm: MultiplicativeTerm,
  ): string => {
    switch (multiplicativeTerm.type) {
      case "atom":
        return reconstructAtomInputString(multiplicativeTerm.data);
      case "parenthetical":
        return reconstructParentheticalInputString(multiplicativeTerm);
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

  const reconstructAdditiveTermInputString = (
    additiveTerm: AdditiveTerm,
  ): string => {
    switch (additiveTerm.type) {
      case "atom":
        return reconstructAtomInputString(additiveTerm.data);
      case "parenthetical":
        return reconstructParentheticalInputString(additiveTerm);
      case "multiplicationOrDivision":
        return reconstructMultiplicationOrDivisionInputString(
          additiveTerm.data,
        );
    }
  };

  const reconstructAdditionOrSubtractionInputString = (
    additionOrSubtraction: AdditionOrSubtraction,
  ): string => {
    return (
      (() => {
        switch (additionOrSubtraction.leftHandExpression.type) {
          case "additionOrSubtraction":
            return reconstructAdditionOrSubtractionInputString(
              additionOrSubtraction.leftHandExpression,
            );
          case "firstAdditiveTerm":
            return reconstructAdditiveTermInputString(
              additionOrSubtraction.leftHandExpression.data,
            );
        }
      })() +
      additionOrSubtraction.operatorToken.stringToken +
      reconstructWhitespaceInputString(
        additionOrSubtraction.followingWhitespaceToken,
      ) +
      reconstructAdditiveTermInputString(additionOrSubtraction.rightHandTerm)
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
