import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js";

export type DiscordClient = Pick<Client, "on" | "once" | "login">;

export type DiscordMessage = Pick<
  OmitPartialGroupDMChannel<Message>,
  "author" | "content" | "reply"
>;
