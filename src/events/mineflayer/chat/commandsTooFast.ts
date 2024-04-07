import { Event } from "../../../interfaces/Event";
import emojis from "../../../util/emojis";
import { latestMessage } from "../../discord/message";

export default {
	name: "chat:commandsTooFast",
	runOnce: false,
	run: async () => {
		if (latestMessage[1]?.reactions.cache.size == 0) {
			await latestMessage[1]?.react(emojis.error)
			await latestMessage[1]?.reply("You are sending commands too fast! Please calm down!");
		}
	},
} as Event;