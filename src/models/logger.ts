export type BasicLogger = Pick<Console, "info" | "error">;

export interface CloneParams {
  readonly contextToAdd: unknown;
  readonly toLog: string;
}

export default interface Logger extends BasicLogger {
  readonly clone: ({ contextToAdd, toLog }: CloneParams) => Logger;
}
