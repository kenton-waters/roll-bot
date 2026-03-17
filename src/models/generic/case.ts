interface Wrapped<DataType> {
  readonly data: DataType;
}

type MaybeWrappedObject<DataType> = [DataType] extends [unknown[]]
  ? { readonly array: DataType }
  : [DataType] extends [{ type: unknown }]
    ? Wrapped<DataType> // If it already has a "type" property, we wrap the data to avoid collision.
    : DataType; // DataType's properties will be at the same level as the "type" property. No wrapping.

type MaybeWrappedData<DataType> = [DataType] extends [undefined | null]
  ? object // We don't add any other required properties for an undefined or null DataType
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
              : Wrapped<DataType>; // Unions with primitives (e.g. string | number) end up in this branch (not primitive and not object).

type Case<CaseName, DataType = undefined> = {
  readonly type: CaseName; // All instances will have the type property
} & MaybeWrappedData<DataType>;

/*type X = Case<"x", string | number>;
const test: X = {
  type: "x",
  data: 0,
};

// Usage:

interface WithType {
  type: number;
  otherProp: string;
}

interface WithoutType {
  otherProp1: string;
  otherProp2: string;
}

type Example =
  | Case<"undefined">
  | Case<"null", null>
  | Case<"string", string>
  | Case<"number", number>
  | Case<"boolean", boolean>
  | Case<"bigint", bigint>
  | Case<"symbol", symbol>
  | Case<"withType", WithType>
  | Case<"withoutType", WithoutType>;

function Consume(param: Example) {
  switch (param.type) {
    case "undefined":
      // no properties to log
      break;
    case "null":
      // no properties to log
      break;
    case "string":
      console.log(param.string);
      break;
    case "number":
      console.log(param.number);
      break;
    case "boolean":
      console.log(param.boolean);
      break;
    case "bigint":
      console.log(param.bigint);
      break;
    case "symbol":
      console.log(param.symbol);
      break;
    case "withType":
      console.log(param.data.otherProp);
      break;
    case "withoutType":
      console.log(param.otherProp1);
      console.log(param.otherProp2);
      break;
  }
}*/

export type { Case as default };
