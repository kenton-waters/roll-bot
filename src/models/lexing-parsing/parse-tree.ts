import type Tagged from "../generic/tagged.js";
import type { WhitespaceToken } from "./token.js";

export default interface ParseTree {
  readonly initialWhitespace?: WhitespaceToken;
  readonly root?: Expression;
}

type Expression = Tagged<"additionSubtraction"> | Tagged<"atom", Atom>;

type Atom = Tagged<"integer", Integer> | Tagged<"diceRoll">;

/*interface FollowingWhitespace {
  readonly followingWhitespace?: WhitespaceToken;
}*/

type Integer = Tagged<"negative"> | Tagged<"nonnegative">;

/*interface IntegerData extends FollowingWhitespace {
  readonly value: number;
  readonly 
}

interface DiceRoll extends FollowingWhitespace {}
*/
