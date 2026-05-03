import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import { getLevel } from "../util/skillXP";
import { shortenNumber } from "../util/shortenNumber";
import fetchSkyblockProfiles from "../util/requests/fetchSkyblockProfiles";

export default {
    name: "hotm",
    aliases: ["powder"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        const user = args.length === 0 ? name : args[0];
        if (typeof user != "string") return botResponse(bot, channel, "Usage: !hotm <ign>");
        const mojangProfile = await fetchMojangProfile(user as string);
        if (isFetchError(mojangProfile)) return botResponse(bot, channel, "Mojang API could not be reached. Is " + user + " the correct name?");
        const skyblockProfiles = await fetchSkyblockProfiles(mojangProfile.id);
        if (isFetchError(skyblockProfiles)) return botResponse(bot, channel, "Skyblock API could not be reached.");
        
        skyblockProfiles.profiles.forEach(async (profile: any) => {
            if (profile.selected != true) return;
            let hotm = getLevel(
            profile["members"][mojangProfile.id]["mining_core"]["experience"], "hotm");
            let mithril = profile["members"][mojangProfile.id]["mining_core"]["powder_mithril"] + profile["members"][mojangProfile.id]["mining_core"]["powder_spent_mithril"];
            let gemstone = profile["members"][mojangProfile.id]["mining_core"]["powder_gemstone"] + profile["members"][mojangProfile.id]["mining_core"]["powder_spent_gemstone"];
            let glacite = profile["members"][mojangProfile.id]["mining_core"]["powder_glacite"] + profile["members"][mojangProfile.id]["mining_core"]["powder_spent_glacite"];

            botResponse(bot, channel, `(${user}) | HOTM: ${hotm} | Mithril: ${shortenNumber(mithril.toString() == "NaN" ? 0 : mithril,)} | Gemstone: ${shortenNumber(gemstone.toString() == "NaN" ? 0 : gemstone)} | Glacite: ${shortenNumber(glacite.toString() == "NaN" ? 0 : glacite)}`);
        })
    }
} as ChatCommand;