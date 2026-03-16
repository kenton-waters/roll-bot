type Case<TagType, PayloadType = undefined> = {
  readonly tag: TagType; // All instances will have the tag property
} & ([PayloadType] extends [undefined | null]
  ? object // We will not add any properties for an undefined or null PayloadType
  : [PayloadType] extends [string]
    ? { readonly string: PayloadType }
    : [PayloadType] extends [number]
      ? { readonly number: PayloadType }
      : [PayloadType] extends [boolean]
        ? { readonly boolean: PayloadType }
        : [PayloadType] extends [bigint]
          ? { readonly bigint: PayloadType }
          : [PayloadType] extends [symbol]
            ? { readonly symbol: PayloadType }
            : [PayloadType] extends [{ tag: unknown }]
              ? { readonly payload: PayloadType }
              : { readonly payload: PayloadType });

/*interface Pretagged {
  tag: number;
  otherProp: string;
}

interface Nontagged {
  otherProp1: string;
  otherProp2: string;
}

type Example =
  | Tagged<"undefined">
  | Tagged<"null", null>
  | Tagged<"string", string>
  | Tagged<"number", number>
  | Tagged<"boolean", boolean>
  | Tagged<"bigint", bigint>
  | Tagged<"symbol", symbol>
  | Tagged<"pretagged", Pretagged>
  | Tagged<"nontagged", Nontagged>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Consume(param: Example) {
  switch (param.tag) {
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
      console.log(param.data.tag);
      console.log(param.data.otherProp);
      break;
    case "nontagged":
      console.log(param.data.otherProp1);
      console.log(param.data.otherProp2);
      break;
  }
}*/

export type { Case as default };
