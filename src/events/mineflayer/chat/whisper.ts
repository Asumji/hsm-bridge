import { Event } from "../../../interfaces/Event";

export default {
	name: "chat:whisper",
	runOnce: false,
	run: async (bot, playerName: string, message: string) => {
		bot.logger.info(playerName + " " + message)
	},
} as Event;
