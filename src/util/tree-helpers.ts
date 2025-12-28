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

export const reconstructInputString = (parseTree: ParseTree): string => {
  return (
    reconstructWhitespaceInputString(parseTree.initialWhitespaceToken) +
    reconstructExpressionInputString(parseTree.expression)
  );
};

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
    reconstructExpressionInputString(additionOrSubtraction.rightHandExpression)
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
