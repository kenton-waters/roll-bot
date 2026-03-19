import type C from "../generic/discriminated-union-case.js";

type Reply = string;

type HandleMessageResult = C<"doNotReply"> | C<"reply", Reply>;

export type { HandleMessageResult as default };
