import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import { getLevel } from "../util/skillXP";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import fetchSkyblockProfiles from "../util/requests/fetchSkyblockProfiles";

export default {
    name: "overflow",
    aliases: ["oskills", "oskill", "overflowskills"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        const user = args.length === 0 ? name : args[0];
                if (typeof user != "string") return botResponse(bot, channel, "Usage: !skills <ign>");
                const mojangProfile = await fetchMojangProfile(user as string);
                if (isFetchError(mojangProfile)) return botResponse(bot, channel, "Mojang API could not be reached. Is " + user + " the correct name?");
                const skyblockProfiles = await fetchSkyblockProfiles(mojangProfile.id);
                if (isFetchError(skyblockProfiles)) return botResponse(bot, channel, "Skyblock API could not be reached.");
                
                skyblockProfiles.profiles.forEach(async (profile: any) => {
                    if (profile.selected != true) return;
                    if (profile["members"][mojangProfile.id]["player_data"]["experience"] == undefined) return botResponse(bot, channel, "Skills API seems to be disabled.");
        
                    const farming = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FARMING"] ?? 0, "farming", 999);
                    const mining = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_MINING"] ?? 0, "mining", 999);
                    const foraging = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FORAGING"] ?? 0, "foraging", 999);
                    const combat = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_COMBAT"] ?? 0, "combat", 999);
                    const alchemy = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ALCHEMY"] ?? 0, "alchemy", 999);
                    const carpentry = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_CARPENTRY"] ?? 0, "carpentry", 999);
                    const fishing = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FISHING"] ?? 0, "fishing", 999);
                    const enchanting = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ENCHANTING"] ?? 0, "enchanting", 999);
                    const taming = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_TAMING"] ?? 0, "taming", 999);
                    const social = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_SOCIAL"] ?? 0, "social", 999);
                    const runecrafting = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_RUNECRAFTING"] ?? 0, "runecrafting", 999);
        
                    const skillAvg = (farming + mining + foraging + combat + alchemy + carpentry + fishing + enchanting + taming) / 9;
        
                    botResponse(bot,channel,`(${user}) | Farming: ${farming} | Mining: ${mining} | Foraging: ${foraging} | Combat: ${combat} | Alchemy: ${alchemy} | Carpentry: ${carpentry} | Fishing: ${fishing} | Enchanting: ${enchanting} | Taming: ${taming} | Social: ${social} | Runecrafting: ${runecrafting} | SkillAvg: ${skillAvg.toFixed(2)}`,);                
                })
    }
} as ChatCommand;