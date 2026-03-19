// Represents one case in a discriminated/tagged union.
type DiscriminatedUnionCase<CaseName, DataType = undefined> = {
  readonly type: CaseName; // All instances will have the type property. This is the discriminant/tag.
} & MaybeWrappedData<DataType>;

type MaybeWrappedData<DataType> = [DataType] extends [undefined | null]
  ? object // There are no other required properties for an undefined or null DataType
  : [DataType] extends [string]
    ? { readonly string: DataType }
    : [DataType] extends [number]
      ? { readonly number: DataType }
      : [DataType] extends [boolean]
        ? { readonly boolean: DataType }
        : [DataType] extends [bigint]
          ? { readonly bigint: DataType }
          : [DataType] extends [symbol]
            ? { readonly symbol: DataType }
            : [DataType] extends [object]
              ? MaybeWrappedObject<DataType>
              : Wrapped<DataType>; // Unions of primitives (e.g. string | number) end up in this branch (not primitive and not object).

type MaybeWrappedObject<DataType> = ["type"] extends [keyof DataType] // If DataType already has a "type" property...
  ? Wrapped<DataType> // ...we wrap the data to avoid collision.
  : DataType; // Here DataType's properties will be at the same level as the "type" property. No wrapping.

interface Wrapped<DataType> {
  readonly data: DataType;
}

export type { DiscriminatedUnionCase as default };
