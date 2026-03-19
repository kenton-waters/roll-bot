import type C from "../generic/discriminated-union-case.js";
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
  | C<"untokenizableInput", TokenizationFailure>
  | C<"implementationError", ImplementationError>
  | C<"success", Token[]>;

export type { TokenizeResult as default };
