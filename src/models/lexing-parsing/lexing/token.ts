import type Tagged from "../../generic/tagged.js";

interface AbstractToken {
  readonly stringToken: string;
}

interface IntegerToken extends AbstractToken {
  readonly numericValue: number;
}

type Token = Tagged<"integer", IntegerToken>;

export type { Token as default };
