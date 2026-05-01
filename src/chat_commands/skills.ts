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
        if (typeof user != "string") botResponse(bot, channel, "Usage: !bank <ign>");
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

                let farmingCap = profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"] == undefined? 50: 50 + profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"];
                let tamingCap = hypixelProfile.achievements.skyblock_domesticator == undefined ? 0 : hypixelProfile.achievements.skyblock_domesticator;

                let farming = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FARMING"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FARMING"], "farming", farmingCap);
                let mining = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_MINING"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_MINING"],"mining",);
                let foraging = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FORAGING"] == undefined? 0: profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FORAGING"],"foraging",);
                let combat = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_COMBAT"] ==undefined? 0: profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_COMBAT"],"combat",);
                let alchemy = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ALCHEMY"] == undefined? 0: profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ALCHEMY"],"alchemy",);
                let carpentry = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_CARPENTRY"] == undefined? 0: profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_CARPENTRY"],"carpentry",);
                let fishing = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FISHING"] == undefined? 0: profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FISHING"],"fishing",);
                let enchanting = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ENCHANTING"] == undefined? 0: profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ENCHANTING"],"enchanting",);
                let taming = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_TAMING"] ==undefined? 0: profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_TAMING"],"taming",tamingCap,);
                let social = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_SOCIAL"] ==undefined? 0: profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_SOCIAL"],"social",);
                let runecrafting = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_RUNECRAFTING"] == undefined? 0: profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_RUNECRAFTING"],"runecrafting",);

                let skillAvg =(farming + mining + foraging + combat + alchemy + carpentry + fishing + enchanting + taming) / 9;

                botResponse(bot,channel,`(${user}) | Farming: ${farming} | Mining: ${mining} | Foraging: ${foraging} | Combat: ${combat} | Alchemy: ${alchemy} | Carpentry: ${carpentry} | Fishing: ${fishing} | Enchanting: ${enchanting} | Taming: ${taming} | Social: ${social} | Runecrafting: ${runecrafting} | SkillAvg: ${skillAvg.toFixed(2)}`,);                
            })
        })
    }
} as ChatCommand;