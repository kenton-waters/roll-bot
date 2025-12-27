import type Token from "../models/lexing-parsing/token.js";

export const followEachWith = <ElementType>(
  array: ElementType[],
  separator: ElementType,
): (ElementType | undefined)[] => {
  if (array.length === 0) return array;

  return [array[0], separator, ...followEachWith(array.slice(1), separator)];
};

export const inputStringLength = (tokens: Token[]): number => {
  return tokens.reduce(
    (accumulator, currentToken) =>
      accumulator + currentToken.data.stringToken.length,
    0,
  );
};

export const recoverInputString = (tokens: Token[]): string => {
  return tokens.reduce(
    (accumulator, currentToken) => accumulator + currentToken.data.stringToken,
    "",
  );
};
