import { EmbedBuilder } from "discord.js";
import { Command } from "../interfaces/Command";

export default {
	data: {
		name: "online",
		description: "View everyone that's currently online.",
		options: [],
	},
	run: async (bot, interaction) => {
		const embed = new EmbedBuilder()
			.setTitle("Guild members currently online")
			.setDescription(`${bot.onlineCount}/${bot.totalCount}\n\n${bot.currentlyOnline.replace(/ \| $/, "")}`)
			.setFooter({
				text: "made by @asumji",
				iconURL:
					"http://asumji.duckdns.org/images/favicon.ico",
			});
		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
	staffOnly: 2,
} as Command;
