import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";

export default {
    name: "math",
    aliases: ["calc", "calculate"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[]) => {
        if (args.length == 0) return botResponse(bot, channel, "Usage: !math <expression>");
        let expression = args.join(" ")
        if (/[^[\d\+\-\*\/ \(\)\[\]]+$]/.test(expression)) return botResponse(bot, channel, "Expression contains invalid characters.");
        try {
            let result = eval(args.join(" "))
            botResponse(bot, channel, "Result: " + result);
        } catch (e) {
            botResponse(bot, channel, "Invalid expression.");
        }
    }
} as ChatCommand;