export type BasicLogger = Pick<Console, "info" | "error">;

export default interface Logger extends BasicLogger {
  readonly logWithNew: (
    contextToAdd: unknown,
    ...toLogWithNew: unknown[]
  ) => Logger;
}
