import type { Client } from "discord.js";

type DiscordClient = Pick<Client, "once" | "login">;

export type { DiscordClient as default };
