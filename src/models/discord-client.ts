import type { Client } from "discord.js";

type DiscordClient = Pick<Client, "on" | "once" | "login">;

export type { DiscordClient as default };
