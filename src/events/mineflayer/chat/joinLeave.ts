import { Event } from "../../../interfaces/Event";

export default {
	name: "chat:joinLeave",
	runOnce: false,
	run: async (bot, playerName: string, status: "joined" | "left") => {
		status === "joined" ? bot.onlineCount++ : bot.onlineCount--;

		await bot.logger.info(playerName)
	},
} as Event;
