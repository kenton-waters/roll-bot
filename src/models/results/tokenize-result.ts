import type Tagged from "../generic/tagged.js";
import type Token from "../lexing-parsing/lexing/token.js";

interface UnexpectedCharacterData {
  readonly character: string;
  readonly position: number;
}

type TokenizeResult =
  | Tagged<"unexpectedCharacter", UnexpectedCharacterData>
  | Tagged<"success", Token[]>;

export type { TokenizeResult as default };
