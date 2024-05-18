import { Event } from "../../../interfaces/Event";
import { escapeMarkdown } from "discord.js";
import getRankColor from "../../../util/getRankColor";
import { latestMessage } from "../../discord/message";
import emojis from "../../../util/emojis";

export default {
	name: "chat:guildChat",
	runOnce: false,
	run: async (
		bot,
		channel: "Guild" | "Officer",
		rank: string | undefined,
		playerName: string,
		guildRank: string | undefined,
		message: string,
	) => {
		if (playerName == bot.mineflayer._client.username) {
			if (latestMessage[1]?.reactions.cache.size == 0) latestMessage[1]?.react(emojis.success);
			return;
		}

		if (message.includes("@everyone") || message.includes("@here")) return

		const content = ` **${rank ? rank + " " : ""}${escapeMarkdown(playerName)}${
			guildRank ? " " + guildRank : ""
		}:** ${escapeMarkdown(message)}`;

		await bot.sendToDiscord(
			channel === "Guild" ? "gc" : "oc",
			content,
			getRankColor(rank),
			true,
			playerName,
			escapeMarkdown(message),
			true,
			guildRank,
		);
	},
} as Event;
