import type Tagged from "../generic/tagged.js";
import type {
  DieToken,
  MinusSignToken,
  NonnegativeIntegerToken,
  WhitespaceToken,
} from "./token.js";

interface WhitespaceFollowing {
  readonly followingWhitespaceToken?: WhitespaceToken;
}

interface IntegerData extends WhitespaceFollowing {
  readonly numericValue: number;
  readonly nonnegativeIntegerToken: NonnegativeIntegerToken;
}

interface NegativeIntegerData extends IntegerData {
  readonly minusSignToken: MinusSignToken;
  readonly internalWhitespaceToken?: WhitespaceToken;
}

type Integer =
  | Tagged<"negative", NegativeIntegerData>
  | Tagged<"nonnegative", IntegerData>;

interface DiceRoll extends WhitespaceFollowing {
  readonly nonnegativeNumDiceToken: NonnegativeIntegerToken;
  readonly numDiceToDWhitespaceToken?: WhitespaceToken;
  readonly dToken: DieToken;
  readonly dToNumFacesWhitespaceToken?: WhitespaceToken;
  readonly positiveNumFacesToken: NonnegativeIntegerToken;
}

type Atom = Tagged<"integer", Integer> | Tagged<"diceRoll", DiceRoll>;

type Expression = Tagged<"additionSubtraction"> | Tagged<"atom", Atom>;

export default interface ParseTree {
  readonly initialWhitespaceToken?: WhitespaceToken;
  readonly expression?: Expression;
}
