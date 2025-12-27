import type Tagged from "../generic/tagged.js";

interface ParseFailure {
  readonly message: string;
  readonly parsedInput: string;
  readonly failurePosition: number;
  readonly unparseableRemnant: string;
}

type ParseResult = Tagged<"unparseableInput", ParseFailure>;

export type { ParseResult as default };
