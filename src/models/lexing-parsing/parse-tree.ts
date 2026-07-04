import type C from "../generic/discriminated-union-case.js";
import type {
  DieToken,
  LeftParenToken,
  SubtractionToken,
  NonnegativeIntegerToken,
  AdditionToken,
  RightParenToken,
  WhitespaceToken,
  MultiplicationToken,
  DivisionToken,
} from "./token.js";

interface WhitespaceFollowing {
  readonly followingWhitespaceToken: WhitespaceToken | null;
}

export interface Sign extends WhitespaceFollowing {
  readonly signValue: "-" | "+";

  readonly signToken: SubtractionToken | AdditionToken | null;
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
type AtomTagged = C<"atom", Atom>;

export type AdditiveTerm =
  | AtomTagged
  | ParentheticalTagged
  | MultiplicationOrDivisionTagged;

export type LeftHandAdditiveExpression =
  | AdditionOrSubtractionTagged
  | C<"firstAdditiveTerm", AdditiveTerm>;

export interface AdditionOrSubtraction extends WhitespaceFollowing {
  readonly leftHandExpression: LeftHandAdditiveExpression;
  readonly operatorToken: AdditionToken | SubtractionToken;
  readonly rightHandTerm: AdditiveTerm;
}
type AdditionOrSubtractionTagged = C<
  "additionOrSubtraction",
  AdditionOrSubtraction
>;

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
type ParentheticalTagged = C<"parenthetical", Parenthetical>;

export type MultiplicativeTerm = AtomTagged | ParentheticalTagged;

export type LeftHandMultiplicativeExpression =
  | MultiplicationOrDivisionTagged
  | C<"firstMultiplicativeTerm", MultiplicativeTerm>;

export interface ExplicitMultiplicationOrDivision extends WhitespaceFollowing {
  readonly leftHandExpression: LeftHandMultiplicativeExpression;
  readonly operatorToken: MultiplicationToken | DivisionToken;
  readonly rightHandTerm: MultiplicativeTerm;
}

export interface ImplicitMultiplicationLeft {
  readonly leftHandParenthetical: Parenthetical;
  readonly rightHandTerm: MultiplicativeTerm;
}
export interface ImplicitMultiplicationRight {
  readonly leftHandExpression: LeftHandMultiplicativeExpression;
  readonly rightHandParenthetical: Parenthetical;
}
export type ImplicitMultiplication =
  | C<"implicitMultiplicationLeft", ImplicitMultiplicationLeft>
  | C<"implicitMultiplicationRight", ImplicitMultiplicationRight>;

export type MultiplicationOrDivision =
  | C<"explicitMultiplicationOrDivision", ExplicitMultiplicationOrDivision>
  | C<"implicitMultiplication", ImplicitMultiplication>;
type MultiplicationOrDivisionTagged = C<
  "multiplicationOrDivision",
  MultiplicationOrDivision
>;

export type Expression =
  | AdditionOrSubtractionTagged
  | MultiplicationOrDivisionTagged
  | AtomTagged
  | ParentheticalTagged;

export default interface ParseTree {
  readonly initialWhitespaceToken: WhitespaceToken | null;
  readonly expression: Expression | null;
}
