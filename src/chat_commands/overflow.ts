import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchSoopyCmd from "../util/requests/fetchSoopyCmd";

export default {
    name: "overflow",
    aliases: ["oskills", "oskill", "overflowskills"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        const user = args.length === 0 ? name : args[0];
        let overflowskill = await fetchSoopyCmd("overflowskills", user as string)
		botResponse(bot, channel, String(overflowskill).replace(")",") |"))
    }
} as ChatCommand;