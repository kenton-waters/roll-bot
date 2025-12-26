export const followEachWith = <ElementType>(
  array: ElementType[],
  separator: ElementType,
): (ElementType | undefined)[] => {
  if (array.length === 0) return array;

  return [array[0], separator, ...followEachWith(array.slice(1), separator)];
};
