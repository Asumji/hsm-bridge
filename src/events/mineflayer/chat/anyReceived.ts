import { Event } from "../../../interfaces/Event";

export default {
	name: "chat:anyReceived",
	runOnce: false,
	run: async (bot, text: string) => {
		if (text.match(/(?:\[.+?\])? (\w+) ●/g) != null) {
			bot.logger.info("received message");
			const matches = (text + "●").matchAll(/(?:\[.+?\])? (\w+) ●/g);
			let count = 0;
			for (let name of matches) {
				count++;
				if (count == 5) {
					count = 0;
					bot.currentlyOnline = bot.currentlyOnline.replace(/ \| $/, "\n");
				}
				bot.currentlyOnline += name[1]?.replace(/_/g, "\\_") + " | ";
			}
		}
	},
} as Event;
