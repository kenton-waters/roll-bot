import type Tagged from "../generic/tagged.js";
import type {
  DieToken,
  MinusSignToken,
  NonnegativeIntegerToken,
  PlusSignToken,
  WhitespaceToken,
} from "./token.js";

interface WhitespaceFollowing {
  readonly followingWhitespaceToken: WhitespaceToken | null;
}

interface Signed extends WhitespaceFollowing {
  readonly signValue: "-" | "+";

  readonly signToken: MinusSignToken | PlusSignToken | null;
}

interface NumericValue {
  readonly numericValue: number;
}

export interface Integer extends Signed, NumericValue, WhitespaceFollowing {
  readonly nonnegativeIntegerToken: NonnegativeIntegerToken;
}

interface NumDice extends NumericValue, WhitespaceFollowing {
  readonly nonnegativeNumDiceToken: NonnegativeIntegerToken | null;
}

interface DieSymbol extends WhitespaceFollowing {
  readonly dToken: DieToken;
}

interface DiceRoll extends Signed, WhitespaceFollowing {
  readonly numDice: NumDice;
  readonly dieSymbol: DieSymbol;
  readonly positiveNumFacesToken: NonnegativeIntegerToken;
}

export type Atom = Tagged<"integer", Integer> | Tagged<"diceRoll", DiceRoll>;

interface AdditionOrSubtraction extends WhitespaceFollowing {
  readonly leftHandAtom: Atom;
  readonly operatorToken: PlusSignToken | MinusSignToken;
  readonly rightHandExpression: Expression;
}

export type Expression =
  | Tagged<"additionOrSubtraction", AdditionOrSubtraction>
  | Tagged<"atom", Atom>;

export default interface ParseTree {
  readonly initialWhitespaceToken: WhitespaceToken | null;
  readonly expression: Expression | null;
}
