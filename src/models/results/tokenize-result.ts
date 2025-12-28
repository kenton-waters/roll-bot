import type Tagged from "../generic/tagged.js";
import type Token from "../lexing-parsing/token.js";

interface TokenizationFailure {
  readonly tokenizedInput: string;
  readonly failurePosition: number;
  readonly untokenizableRemnant: string;
}

interface ImplementationError extends TokenizationFailure {
  readonly message: string;
}

type TokenizeResult =
  | Tagged<"untokenizableInput", TokenizationFailure>
  | Tagged<"implementationError", ImplementationError>
  | Tagged<"success", Token[]>;

export type { TokenizeResult as default };
