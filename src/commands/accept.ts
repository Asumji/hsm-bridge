import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command } from "../interfaces/Command";

export default {
    data: {
        name: "accept",
        description: "Accept a user to the guild!",
        options: [
            {
                name: "user",
                description: "What is the name of the user you want to accept?",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    run: async (bot, interaction, args) => {
        const user = args[0];

        const embed = new EmbedBuilder();
        try {
            await bot.executeTask(`/g accept ${user}`);
            embed.setTitle("Accepted!").setDescription(`\`${user}\` has been accepted into the guild!`).setColor("Green");
        } catch (e) {
            embed
                .setColor("Red")
                .setTitle("Error")
                .setDescription(e as string);
        }

        await interaction.reply({ embeds: [embed] });
    },
    staffOnly: 1,
} as Command;
