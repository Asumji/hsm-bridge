import { Command } from "../interfaces/Command";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import axios from "axios";
import fetchLeaderboard from "../util/requests/fetchLeaderboard";
import { getLevel } from "../util/skillXP";
import fetchHypixelPlayerProfile from "../util/requests/fetchHypixelPlayerProfile";

export default {
	data: {
		name: "reqs",
		description: "Display requirement related info about a player",
        options: [
			{
				name: "player",
				description: "The player you want to view",
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	},
	run: async (bot, interaction) => {
        bot.logger.info("Reqs command")
        const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle(interaction.options.getString("player",true)+(interaction.options.getString("player",true).endsWith("s") ? "'" : "'s")+" relevant guild stats.")
			.setFooter({
				text: "made by @asumji",
				iconURL:
					"https://cdn.discordapp.com/avatars/612625159656046643/c6872f8a0ea475493e54746bb6e5b27b.webp?size=4096",
			});

        const mojangProfile = await fetchMojangProfile(interaction.options.getString("player",true));
		const hypixelProfile = await fetchHypixelPlayerProfile(interaction.options.getString("player",true));

		if (isFetchError(mojangProfile)) return interaction.reply("Mojang API Error\n"+mojangProfile.statusText);
        if (isFetchError(hypixelProfile)) return interaction.reply("Hypixel API Error\n"+hypixelProfile.statusText);
		
		interaction.reply("Getting User Stats...")

		await axios
				.get(
					"https://api.hypixel.net/v2/skyblock/profiles?uuid=" +
						mojangProfile.id +
						"&key=" +
						process.env.HYPIXEL_API_KEY,
				)
				.then((res) => {
					res.data.profiles.forEach(async (profile: any) => {
						if (profile.selected != true) return;

						const lbData = await fetchLeaderboard(mojangProfile.id, profile.profile_id);

						let vamp = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["vampire"];
						if (vamp == undefined)
							vamp = {
								xp: 0,
								boss_kills_tier_3: 0,
								boss_kills_tier_4: 0,
							};

						let lbs = "";
						if (isFetchError(lbData)) {
							lbs = "Leaderboard API couldn't be reached.";
						} else {
							for (let lb in lbData) {
								lbs += `**#${lbData[lb]?.positionIndex}** ${lbData[lb]?.name
									.replace(/(?<=_|\b)[A-z]/g, (letter: string) => letter.toUpperCase())
									.replace(/_/g, " ")}: \`${lbData[lb]?.value}\`\n`;
							}
						}

						let farmingCap =
							profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"] ==
							undefined
								? 50
								: 50 +
								  profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"];
						let tamingCap =
							hypixelProfile.achievements.skyblock_domesticator == undefined
								? 0
								: hypixelProfile.achievements.skyblock_domesticator;
						let skills = profile["members"][mojangProfile.id]["player_data"]["experience"];
						let skillAvg =
							(getLevel(
								skills["SKILL_FARMING"] == undefined ? 0 : skills["SKILL_FARMING"],
								"farming",
								farmingCap,
							) +
								getLevel(skills["SKILL_MINING"] == undefined ? 0 : skills["SKILL_MINING"], "mining") +
								getLevel(
									skills["SKILL_FORAGING"] == undefined ? 0 : skills["SKILL_FORAGING"],
									"foraging",
								) +
								getLevel(skills["SKILL_COMBAT"] == undefined ? 0 : skills["SKILL_COMBAT"], "combat") +
								getLevel(
									skills["SKILL_ALCHEMY"] == undefined ? 0 : skills["SKILL_ALCHEMY"],
									"alchemy",
								) +
								getLevel(
									skills["SKILL_CARPENTRY"] == undefined ? 0 : skills["SKILL_CARPENTRY"],
									"carpentry",
								) +
								getLevel(
									skills["SKILL_FISHING"] == undefined ? 0 : skills["SKILL_FISHING"],
									"fishing",
								) +
								getLevel(
									skills["SKILL_ENCHANTING"] == undefined ? 0 : skills["SKILL_ENCHANTING"],
									"enchanting",
								) +
								getLevel(
									skills["SKILL_TAMING"] == undefined ? 0 : skills["SKILL_TAMING"],
									"taming",
									tamingCap,
								)) /
							9;

						embed.addFields(
							{
								name: "Vampire",
								value: `**Slayer XP**: ${vamp["xp"] != undefined ? vamp["xp"] : 0}\n**T4s**: ${
									vamp["boss_kills_tier_3"] != undefined ? vamp["boss_kills_tier_3"] : 0
								}\n**T5s**: ${vamp["boss_kills_tier_4"] != undefined ? vamp["boss_kills_tier_4"] : 0}`,
								inline: true,
							},
							{
								name: "Skyblock",
								value: `**Level**: ${
									profile["members"][mojangProfile.id]["leveling"]["experience"] / 100
								}\n**Skill Avg**: ${skillAvg.toFixed(2)}\n**Cata**: ${getLevel(
									profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"]["catacombs"][
										"experience"
									],
									"dungeoneering",
								)}`,
								inline: true,
							},
							{ name: "Top 100s", value: lbs == "" ? "None" : lbs },
						);
                        interaction.editReply({embeds:[embed], content:""})
					});
				});
                return
	},
	staffOnly: true,
} as Command;
