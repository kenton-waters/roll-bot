import type Tagged from "../generic/tagged.js";

interface UnexpectedCharacterData {
  readonly character: string;
  readonly position: number;
}

type TokenizeResult = Tagged<"unexpectedCharacter", UnexpectedCharacterData>;

export type { TokenizeResult as default };
