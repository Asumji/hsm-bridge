import { Event } from "../../../interfaces/Event";
import emojis from "../../../util/emojis";
import { latestMessage } from "../../discord/message";

export default {
	name: "chat:advertising",
	runOnce: false,
	run: async () => {
		if (latestMessage[1]?.reactions.cache.size == 0) {
			await latestMessage[1]?.react(emojis.error)
			await latestMessage[1]?.reply("Message was flagged for advertising.");
		}
	},
} as Event;