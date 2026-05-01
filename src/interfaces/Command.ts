import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import Bot from "../classes/Bot";

export interface Command {
	data: ChatInputApplicationCommandData;
	run: ExecuteCommand;
	staffOnly?: number;
}

export interface ChatCommand {
	name: string;
	aliases: string[];
	run: (bot:Bot, channel: "Guild" | "Officer", args: string[], name?: string) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExecuteCommand = (bot: Bot, interaction: ChatInputCommandInteraction, args: any[]) => Promise<void>;
