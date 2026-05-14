import { botResponse, commands } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";

export default {
    name: "aliases",
    aliases: ["alias"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[]) => {
        if (args.length == 0) return botResponse(bot, channel, "Usage: !aliases <command>");
        const command = commands.find(c => c.name === args[0] || c.aliases.includes(args[0] as string));
        if (!command) return botResponse(bot, channel, "Command not found.");
        botResponse(bot, channel, `${command.name}: ${command.aliases.join(", ") ?? "No aliases"}`);
    }
} as ChatCommand;