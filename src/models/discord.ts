import type { Client } from "discord.js";

export type DiscordClient = Pick<Client, "on" | "once" | "login">;

export interface DiscordMessage {
  authorIsBot: boolean;
  content: string;
}
