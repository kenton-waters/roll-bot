type Tagged<TagType, ContentType = undefined> = {
  readonly tag: TagType; // All instances will have the tag property
} & ([ContentType] extends [undefined]
  ? object // We will not add any properties for an undefined ContentType
  : { readonly tag: TagType; readonly data: ContentType });

export type { Tagged as default };
