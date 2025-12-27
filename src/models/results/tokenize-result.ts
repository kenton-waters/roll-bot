import type Tagged from "../generic/tagged.js";
import type Token from "../lexing-parsing/lexing/token.js";

interface TokenizationFailure {
  readonly inputString: string;
  readonly position: number;
  readonly untokenizableRemnant: string;
}

interface ImplementationError extends TokenizationFailure {
  readonly message: string;
}

type TokenizeResult =
  | Tagged<"unexpectedCharacter", TokenizationFailure>
  | Tagged<"implementationError", ImplementationError>
  | Tagged<"success", Token[]>;

export type { TokenizeResult as default };
