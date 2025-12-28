import type Tagged from "../generic/tagged.js";
import type Token from "../lexing-parsing/token.js";

interface RemainingTokens {
  readonly remainingTokens: Token[];
}

interface SuccessData<ParseTo> extends RemainingTokens {
  readonly parsedObject: ParseTo;
}

interface FailureData extends RemainingTokens {
  readonly reason: string;
}

type ParseResult<ParseTo> =
  | Tagged<"success", SuccessData<ParseTo>>
  | Tagged<"failure", FailureData>;

export type { ParseResult as default };
