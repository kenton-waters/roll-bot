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

export interface AdditionToken extends AbstractToken {
  readonly stringToken: "+";
}

export interface SubtractionToken extends AbstractToken {
  readonly stringToken: "-";
}

export interface MultiplicationToken extends AbstractToken {
  readonly stringToken: "*";
}

export interface DivisionToken extends AbstractToken {
  readonly stringToken: "/";
}

export interface LeftParenToken extends AbstractToken {
  readonly stringToken: "(";
}

export interface RightParenToken extends AbstractToken {
  readonly stringToken: ")";
}

type Token =
  | C<"nonnegativeInteger", NonnegativeIntegerToken>
  | C<"die", DieToken>
  | C<"whitespace", WhitespaceToken>
  | C<"addition", AdditionToken>
  | C<"subtraction", SubtractionToken>
  | C<"multiplication", MultiplicationToken>
  | C<"division", DivisionToken>
  | C<"leftParen", LeftParenToken>
  | C<"rightParen", RightParenToken>;

export type { Token as default };
