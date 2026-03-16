import type Tagged from "../generic/case.js";

type Reply = string;

type HandleMessageResult = Tagged<"doNotReply"> | Tagged<"reply", Reply>;

export type { HandleMessageResult as default };
