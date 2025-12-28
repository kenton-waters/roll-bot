type Tagged<TagType, DataType = undefined> = [DataType] extends [undefined]
  ? { readonly tag: TagType }
  : { readonly tag: TagType; readonly data: DataType };

export type { Tagged as default };
