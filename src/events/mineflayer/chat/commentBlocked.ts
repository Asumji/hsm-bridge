import Emojis from "../../../util/emojis";
import { Event } from "../../../interfaces/Event";
import { latestMessage } from "../../discord/message";

export default {
	name: "chat:commentBlocked",
	runOnce: false,
	run: async (bot, comment: string, reason: string) => {
		bot.logger.warn(`Comment blocked by Hypixel: ${comment} (${reason})`);
		await bot.sendToDiscord(
			"oc",
			`${Emojis.alert} "${comment}" was blocked by Hypixel because **${reason}**.`,
		);
		await latestMessage[1]?.reply("Message got blocked by hypixel, if you are bypassing the filter I will track you down and eat your first born child. fr tho like please don't or staff will have to guild mute you.")
	},
} as Event;
