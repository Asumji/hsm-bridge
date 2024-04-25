import { Event } from "../../../interfaces/Event";
import emojis from "../../../util/emojis";
export default {
	name: "chat:memberJoinLeave",
	runOnce: false,
	run: async (bot, rank: string | undefined, playerName: string, type: "joined" | "left") => {
		bot.logger.info(rank + " " + playerName + " " + type);
		if (type === "joined") {
			bot.sendGuildMessage("gc", "Welcome to the HSM guild! Be sure to check out /g discord ^-^");
		}
		bot.sendToDiscord(
			"gc",
			`${type == "joined" ? emojis.success : emojis.error} ${playerName} ${type} the guild!`,
			type == "joined" ? 0x00ff00 : 0xff0000,
		);
	},
} as Event;
