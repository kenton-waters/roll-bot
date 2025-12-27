import type Tagged from "../../generic/tagged.js";

interface AbstractToken {
  readonly stringToken: string;
}

interface IntegerToken extends AbstractToken {
  readonly numericValue: number;
}

type DieToken = AbstractToken;

type WhitespaceToken = AbstractToken;

interface PlusSignToken extends AbstractToken {
  readonly stringToken: "+";
}

type Token =
  | Tagged<"integer", IntegerToken>
  | Tagged<"die", DieToken>
  | Tagged<"whitespace", WhitespaceToken>
  | Tagged<"plusSign", PlusSignToken>;

export type { Token as default };
