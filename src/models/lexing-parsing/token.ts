import type C from "../generic/discriminated-union-case.js";

interface AbstractToken {
  readonly stringToken: string;
}

export interface NonnegativeIntegerToken extends AbstractToken {
  readonly numericValue: number;
}

export interface DieToken extends AbstractToken {
  readonly stringToken: "D" | "d";
}

export type WhitespaceToken = AbstractToken;

export interface PlusSignToken extends AbstractToken {
  readonly stringToken: "+";
}

export interface MinusSignToken extends AbstractToken {
  readonly stringToken: "-";
}

type Token =
  | C<"nonnegativeInteger", NonnegativeIntegerToken>
  | C<"die", DieToken>
  | C<"whitespace", WhitespaceToken>
  | C<"plusSign", PlusSignToken>
  | C<"minusSign", MinusSignToken>;

export type { Token as default };
