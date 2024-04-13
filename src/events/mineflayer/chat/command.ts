import { Event } from "../../../interfaces/Event";
import { runCommand } from "../../../util/commands";

export default {
	name: "chat:command",
	runOnce: false,
	run: async (bot, chat, name, gRank, command, spacedArgs) => {
		bot.logger.info(gRank + " " + name + " " + command + " " + spacedArgs)

        const args = spacedArgs?.split(" ")
		console.log(args)
        runCommand(bot,chat,command,name,args)
	},
} as Event;