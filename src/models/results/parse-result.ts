import type Tagged from "../generic/tagged.js";
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
  | Tagged<"success", ParseSuccess<ParseTo>>
  | Tagged<"failure", ParseFailure>;

export type { ParseResult as default };
