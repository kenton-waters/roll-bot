type Case<CaseName, DataType = undefined> = {
  readonly type: CaseName; // All instances will have the type property
} & ([DataType] extends [undefined | null]
  ? object // We will not add any properties for an undefined or null DataType
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
            : [DataType] extends [unknown[]]
              ? { readonly array: DataType }
              : [DataType] extends [{ type: unknown }]
                ? { readonly data: DataType }
                : DataType);

/*interface Pretagged {
  type: number;
  otherProp: string;
}

interface Nontagged {
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
  | Case<"pretagged", Pretagged>
  | Case<"nontagged", Nontagged>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    case "pretagged":
      console.log(param.data);
      console.log(param.data.otherProp);
      break;
    case "nontagged":
      console.log(param.otherProp1);
      console.log(param.otherProp2);
      break;
  }
}*/

export type { Case as default };
