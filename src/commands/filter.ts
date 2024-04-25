import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { FilterEntry } from "../interfaces/FilterEntry";
import { Command } from "../interfaces/Command";
import _filter from "../util/blacklist/_filter.json";
import writeToJsonFile from "../util/writeToJsonFile";

export default {
	data: {
		name: "filter",
		description: "Add or remove a word from the filter!",
		options: [
			{
				name: "add",
				description: "Adds a word to the filter",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "word",
						description: "The word you want to add",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
			{
				name: "remove",
				description: "Removes a word from the filter",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "word",
						description: "The word you want to remove",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
			{
				name: "list",
				description: "Lists the filter",
				type: ApplicationCommandOptionType.Subcommand,
			},
		],
	},
	run: async (bot, interaction, args) => {
		const type = interaction.options.getSubcommand() as "add" | "remove" | "list";
		const filter = _filter as FilterEntry;

		if (type !== "list") {
			const isOnFilter = filter.words.some((word: string) => word === " " + args[0] + " ");
			if ((type === "add" && isOnFilter) || (type === "remove" && !isOnFilter)) {
				const embed = new EmbedBuilder()
					.setColor("Red")
					.setTitle("Error")
					.setDescription(`That word is ${type === "add" ? "already" : "not"} in the filter!`);

				await interaction.reply({ embeds: [embed] });
				return;
			}
			bot.logger.info("filter: " + type + " " + args[0]);

			const successEmbed = new EmbedBuilder()
				.setColor(0x00ff00)
				.setDescription(
					type == "add" ? `Added ${args[0]} to the filter!` : `Removed ${args[0]} from the filter!`,
				);

			if (type === "add") {
				_filter.words.push(" " + args[0] + " ");
				writeToJsonFile("./src/util/blacklist/_filter.json", _filter, interaction, successEmbed);
			} else {
				_filter.words.splice(_filter.words.indexOf(" " + args[0] + " "));
				writeToJsonFile("./src/util/blacklist/_filter.json", _filter, interaction, successEmbed);
			}
		} else {
			await interaction.reply({ content: `\`\`\`js\n${JSON.stringify(_filter)}\`\`\``, ephemeral: true });
		}
	},
	staffOnly: true,
} as Command;
