import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import axios from "axios";
import logError from "../util/logError";
import fetchHypixelPlayerProfile from "../util/requests/fetchHypixelPlayerProfile";
import { getLevel } from "../util/skillXP";

export default {
    name: "skills",
    aliases: ["skill"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        const user = args.length === 0 ? name : args[0];
        if (typeof user != "string") return botResponse(bot, channel, "Usage: !skills <ign>");
        const mojangProfile = await fetchMojangProfile(user as string);
        if (isFetchError(mojangProfile)) return botResponse(bot, channel, "Mojang API could not be reached. Is " + user + " the correct name?");
        await axios.get("https://api.hypixel.net/v2/skyblock/profiles?uuid=" + mojangProfile.id + "&key=" + process.env.HYPIXEL_API_KEY,
			{
                headers: {
					"User-Agent": "HotShirtlessMen BridgeBot 1.0.0"
				}
            }
		)
		.then((res) => {
            res.data.profiles.forEach(async (profile: any) => {
                if (profile.selected != true) return;
                const hypixelProfile = await fetchHypixelPlayerProfile(user as string);
                if (isFetchError(hypixelProfile)) {
                    logError(new Error("API unresponsive " + hypixelProfile.statusText),hypixelProfile.statusText);
                    botResponse(bot, channel, "API could not be reached.");
                    return;
                }

                const farmingCap = profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"] == undefined? 50: 50 + profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"];
                const tamingCap = hypixelProfile.achievements.skyblock_domesticator == undefined ? 0 : hypixelProfile.achievements.skyblock_domesticator;

                const farming = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FARMING"] ?? 0, "farming", farmingCap);
                const mining = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_MINING"] ?? 0, "mining",);
                const foraging = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FORAGING"] ?? 0, "foraging",);
                const combat = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_COMBAT"] ?? 0, "combat",);
                const alchemy = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ALCHEMY"] ?? 0, "alchemy",);
                const carpentry = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_CARPENTRY"] ?? 0, "carpentry",);
                const fishing = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FISHING"] ?? 0, "fishing",);
                const enchanting = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ENCHANTING"] ?? 0, "enchanting",);
                const taming = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_TAMING"] ?? 0, "taming",tamingCap,);
                const social = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_SOCIAL"] ?? 0, "social",);
                const runecrafting = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_RUNECRAFTING"] ?? 0, "runecrafting",);

                const skillAvg =(farming + mining + foraging + combat + alchemy + carpentry + fishing + enchanting + taming) / 9;

                botResponse(bot,channel,`(${user}) | Farming: ${farming} | Mining: ${mining} | Foraging: ${foraging} | Combat: ${combat} | Alchemy: ${alchemy} | Carpentry: ${carpentry} | Fishing: ${fishing} | Enchanting: ${enchanting} | Taming: ${taming} | Social: ${social} | Runecrafting: ${runecrafting} | SkillAvg: ${skillAvg.toFixed(2)}`,);                
            })
        })
    }
} as ChatCommand;