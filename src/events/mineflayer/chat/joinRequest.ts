import { Event } from "../../../interfaces/Event";
import { EmbedBuilder } from "discord.js";
import fetchMojangProfile from "../../../util/requests/fetchMojangProfile";
import isFetchError from "../../../util/requests/isFetchError";
import isUserBlacklisted from "../../../util/blacklist/isUserBlacklisted";
import emojis from "../../../util/emojis";
import axios from "axios";
import { getLevel } from "../../../util/skillXP";
import fetchHypixelPlayerProfile from "../../../util/requests/fetchHypixelPlayerProfile";

export default {
	name: "chat:joinRequest",
	runOnce: false,
	run: async (bot, playerName: string) => {
		bot.logger.info("Join req: " + playerName);
		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle(emojis.join + " " + playerName + " wants to join the guild!")
			.setFooter({
				text: "made by @asumji",
				iconURL:
					"https://cdn.discordapp.com/avatars/612625159656046643/c6872f8a0ea475493e54746bb6e5b27b.webp?size=4096",
			});

		const mojangProfile = await fetchMojangProfile(playerName);
		const hypixelProfile = await fetchHypixelPlayerProfile(playerName);

		if (isFetchError(hypixelProfile)) return;
		if (isFetchError(mojangProfile)) return;

		if (isUserBlacklisted(mojangProfile.id)) {
			bot.sendGuildMessage("oc", `The player ${playerName} is blacklisted. Do NOT accept their join request.`);
			embed.setColor(0xff0000);
			embed.setTitle(emojis.warning + " " + playerName + " is blacklisted.\nDO NOT accept their join request!");
			bot.officerChannel?.send({ embeds: [embed] });
		} else {
			await axios
			.get(
				"https://api.hypixel.net/v2/skyblock/profiles?uuid=" +
					mojangProfile.id +
					"&key=" +
					process.env.HYPIXEL_API_KEY,
				{headers:{
					"User-Agent": "HotShirtlessMen BridgeBot 1.0.0"
				}}
			)
			.then((res) => {
				res.data.profiles.forEach(async (profile: any) => {
					if (profile.selected != true) return;
					let skillAvg: any = "API Off"
					if (profile["members"][mojangProfile.id]["player_data"]["experience"]) {
						let farmingCap = profile["members"][mojangProfile.id]["jacobs_contest"]["perks"] ?
							profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"] ==
							undefined
								? 50
								: 50 +
									profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"]: 0;
						let tamingCap =
							hypixelProfile.achievements.skyblock_domesticator == undefined
								? 0
								: hypixelProfile.achievements.skyblock_domesticator;
						let skills = profile["members"][mojangProfile.id]["player_data"]["experience"];
						skillAvg =
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
					}

					embed.addFields(
						{
							name: "Skyblock",
							value: `**Level**: ${
								profile["members"][mojangProfile.id]["leveling"]["experience"] / 100
								}\n**Skill Avg**: ${typeof skillAvg == "number" ? skillAvg.toFixed(2) : skillAvg}\n**Cata**: ${getLevel(
								profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"]["catacombs"][
									"experience"
								],
								"dungeoneering",
							)}`,
							inline: true,
						}
					);
					bot.sendGuildMessage(
						"oc",
						`Skyblock Level: ${profile["members"][mojangProfile.id]["leveling"]["experience"] / 100}`,
					);
					bot.officerChannel?.send({ embeds: [embed] });
				});
			});
		}
	},
} as Event;
