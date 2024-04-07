import { Event } from "../../../interfaces/Event";
import emojis from "../../../util/emojis";
import { latestMessage } from "../../discord/message";

export default {
	name: "chat:sameMessageTwice",
	runOnce: false,
	run: async () => {
		if (latestMessage[1]?.reactions.cache.size == 0) {
			await latestMessage[1]?.react(emojis.error)
			await latestMessage[1]?.reply("You cannot say the same message twice!");
		}
	},
} as Event;
