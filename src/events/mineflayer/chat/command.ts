import { Event } from "../../../interfaces/Event";
import { runCommand } from "../../../util/commands";

export default {
	name: "chat:command",
	runOnce: false,
	run: async (bot, chat, rank, name, gRank, command, spacedArgs) => {
		bot.logger.info(chat, rank, name, gRank, command, spacedArgs)
		runCommand(bot, chat, command + " " + spacedArgs, name);
	},
} as Event;
