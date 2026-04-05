import type C from "../generic/discriminated-union-case.js";
import type {
  DieToken,
  LeftParenToken,
  MinusSignToken,
  NonnegativeIntegerToken,
  PlusSignToken,
  RightParenToken,
  WhitespaceToken,
} from "./token.js";

interface WhitespaceFollowing {
  readonly followingWhitespaceToken: WhitespaceToken | null;
}

export interface Sign extends WhitespaceFollowing {
  readonly signValue: "-" | "+";

  readonly signToken: MinusSignToken | PlusSignToken | null;
}

interface Signed {
  readonly sign: Sign;
}

interface NumericValue {
  readonly numericValue: number;
}

export interface Integer extends Signed, NumericValue, WhitespaceFollowing {
  readonly nonnegativeIntegerToken: NonnegativeIntegerToken;
}

export interface NumDice extends NumericValue, WhitespaceFollowing {
  readonly nonnegativeNumDiceToken: NonnegativeIntegerToken | null;
}

interface DieSymbol extends WhitespaceFollowing {
  readonly dieToken: DieToken;
}

export interface DiceRoll extends Signed, WhitespaceFollowing {
  readonly numDice: NumDice;
  readonly dieSymbol: DieSymbol;
  readonly positiveNumFacesToken: NonnegativeIntegerToken;
}

export type Atom = C<"integer", Integer> | C<"diceRoll", DiceRoll>;

export interface AdditionOrSubtraction extends WhitespaceFollowing {
  readonly leftHandAtom: Atom;
  readonly operatorToken: PlusSignToken | MinusSignToken;
  readonly rightHandExpression: Expression;
}

export interface LeftParen extends WhitespaceFollowing {
  readonly leftParenToken: LeftParenToken;
}

export interface RightParen extends WhitespaceFollowing {
  readonly rightParenToken: RightParenToken;
}

export interface Parenthetical {
  readonly leftParen: LeftParen;
  readonly internalExpression: Expression;
  readonly rightParen: RightParen;
}

export type Expression =
  | C<"additionOrSubtraction", AdditionOrSubtraction>
  | C<"atom", Atom>
  | C<"parenthetical", Parenthetical>;

export default interface ParseTree {
  readonly initialWhitespaceToken: WhitespaceToken | null;
  readonly expression: Expression | null;
}
