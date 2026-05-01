import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";

export default {
    name: "active",
    aliases: ["activerole"],
    run: async (bot: Bot, channel: "Guild" | "Officer") => {
        botResponse(bot, channel, "The top 3 players every week in guild xp get the active guild rank and discord role.")
    }
} as ChatCommand;