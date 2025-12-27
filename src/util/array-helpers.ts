import type Token from "../models/lexing-parsing/token.js";

export const followEachWith = <ElementType>(
  array: ElementType[],
  separator: ElementType,
): (ElementType | undefined)[] => {
  if (array.length === 0) return array;

  return [array[0], separator, ...followEachWith(array.slice(1), separator)];
};

export const reconstructInputString = (tokens: Token[]): string => {
  return tokens.reduce(
    (accumulator, currentToken) => accumulator + currentToken.data.stringToken,
    "",
  );
};
