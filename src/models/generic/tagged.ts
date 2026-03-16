type Tagged<TagType, ContentType = undefined> = {
  readonly tag: TagType; // All instances will have the tag property
} & ([ContentType] extends [undefined | null]
  ? object // We will not add any properties for an undefined or null ContentType
  : [ContentType] extends [string]
    ? { readonly string: ContentType }
    : [ContentType] extends [number]
      ? { readonly number: ContentType }
      : [ContentType] extends [boolean]
        ? { readonly boolean: ContentType }
        : [ContentType] extends [bigint]
          ? { readonly bigint: ContentType }
          : [ContentType] extends [symbol]
            ? { readonly symbol: ContentType }
            : [ContentType] extends [{ tag: unknown }]
              ? { readonly data: ContentType }
              : { readonly data: ContentType });

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

export type { Tagged as default };
