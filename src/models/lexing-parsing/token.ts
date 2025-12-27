import type Tagged from "../generic/tagged.js";

interface AbstractToken {
  readonly stringToken: string;
}

interface NonnegativeIntegerToken extends AbstractToken {
  readonly numericValue: number;
}

interface DieToken extends AbstractToken {
  readonly stringToken: "D" | "d";
}

export type WhitespaceToken = AbstractToken;

interface PlusSignToken extends AbstractToken {
  readonly stringToken: "+";
}

interface MinusSignToken extends AbstractToken {
  readonly stringToken: "-";
}

type Token =
  | Tagged<"nonnegativeInteger", NonnegativeIntegerToken>
  | Tagged<"die", DieToken>
  | Tagged<"whitespace", WhitespaceToken>
  | Tagged<"plusSign", PlusSignToken>
  | Tagged<"minusSign", MinusSignToken>;

export type { Token as default };
