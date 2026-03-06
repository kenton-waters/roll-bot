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
            : "tag" extends keyof [ContentType]
              ? { readonly content: ContentType }
              : { readonly data: ContentType });

export type { Tagged as default };
