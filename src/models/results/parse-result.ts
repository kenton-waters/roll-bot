import type C from "../generic/discriminated-union-case.js";
import type Token from "../lexing-parsing/token.js";

interface RemainingTokens {
  readonly remainingTokens: Token[];
}

export interface ParseSuccess<ParseTo> extends RemainingTokens {
  readonly parsedObject: ParseTo;
}

interface ParseFailure extends RemainingTokens {
  readonly reason: string;
}

type ParseResult<ParseTo> =
  | C<"success", ParseSuccess<ParseTo>>
  | C<"failure", ParseFailure>;

export type { ParseResult as default };
