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
					"https://cdn.discordapp.com/avatars/612625159656046643/c6872f8a0ea475493e54746bb6e5b27b.webp?size=4096",
			});
		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
	staffOnly: false,
} as Command;
