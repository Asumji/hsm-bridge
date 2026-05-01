import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";

export default {
    name: "kuudra",
    aliases: ["kudra", "kud"],
    run: async (bot: Bot, channel: "Guild" | "Officer") => {
        botResponse(bot, channel, "kuudra.")
    }
} as ChatCommand;