export type BasicLogger = Pick<Console, "info" | "error">;

export default interface Logger extends BasicLogger {
  readonly clone: (contextToAdd: unknown, ...toLog: unknown[]) => Logger;
}
