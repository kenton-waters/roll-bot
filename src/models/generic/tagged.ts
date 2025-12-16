type Tagged<TagType, DataType = undefined> = DataType extends undefined
  ? { tag: TagType }
  : { tag: TagType; data: DataType };

export type { Tagged as default };
