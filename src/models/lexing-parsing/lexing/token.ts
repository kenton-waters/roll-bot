import type Tagged from "../../generic/tagged.js";

interface AbstractToken {
  readonly stringToken: string;
}

interface IntegerToken extends AbstractToken {
  readonly numericValue: number;
}

type DieToken = AbstractToken;

type Token = Tagged<"integer", IntegerToken> | Tagged<"die", DieToken>;

export type { Token as default };
