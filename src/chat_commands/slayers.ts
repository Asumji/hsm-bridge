import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import { getLevel } from "../util/skillXP";
import fetchSkyblockProfiles from "../util/requests/fetchSkyblockProfiles";

export default {
    name: "slayers",
    aliases: ["slayer"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        const user = args.length === 0 ? name : args[0];
        if (typeof user != "string") return botResponse(bot, channel, "Usage: !slayers <ign>");
        const mojangProfile = await fetchMojangProfile(user as string);
        if (isFetchError(mojangProfile)) return botResponse(bot, channel, "Mojang API could not be reached. Is " + user + " the correct name?");
        const skyblockProfiles = await fetchSkyblockProfiles(mojangProfile.id);
        if (isFetchError(skyblockProfiles)) return botResponse(bot, channel, "Skyblock API could not be reached.");
        
        skyblockProfiles.profiles.forEach(async (profile: any) => {
            if (profile.selected != true) return;
            let zombie = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["zombie"];
            zombie = getLevel(zombie.xp == undefined ? 0 : zombie.xp, "zombie");
            let spider = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["spider"];
            spider = getLevel(spider.xp == undefined ? 0 : spider.xp, "spider");
            let wolf = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["wolf"];
            wolf = getLevel(wolf.xp == undefined ? 0 : wolf.xp, "wolf");
            let enderman = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["enderman"];
            enderman = getLevel(enderman.xp == undefined ? 0 : enderman.xp, "enderman");
            let blaze = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["blaze"];
            blaze = getLevel(blaze.xp == undefined ? 0 : blaze.xp, "blaze");
            let vamp = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["vampire"];
            vamp = getLevel(vamp.xp == undefined ? 0 : vamp.xp, "vamp");

            botResponse(bot, channel, `(${user}) | Zombie: ${zombie} | Spider: ${spider} | Wolf: ${wolf} | Enderman: ${enderman} | Blaze: ${blaze} | Vamp: ${vamp}`);
        })
    }
} as ChatCommand;