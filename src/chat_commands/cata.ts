import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import { getLevel } from "../util/skillXP";
import fetchSkyblockProfiles from "../util/requests/fetchSkyblockProfiles";

export default {
    name: "cata",
    aliases: ["dungeon", "dungeons", "catacombs"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        const user = args.length === 0 ? name : args[0];
        if (typeof user != "string") return botResponse(bot, channel, "Usage: !cata [ign]");
        const mojangProfile = await fetchMojangProfile(user as string);
        if (isFetchError(mojangProfile)) return botResponse(bot, channel, "Mojang API could not be reached. Is " + user + " the correct name?");
        const skyblockProfiles = await fetchSkyblockProfiles(mojangProfile.id);
        if (isFetchError(skyblockProfiles)) return botResponse(bot, channel, "Skyblock API could not be reached.");
        console.log(skyblockProfiles)
        skyblockProfiles.profiles.forEach(async (profile: any) => {
            if (profile.selected != true) return;
            if (profile["members"][mojangProfile.id]["dungeons"] == undefined) return botResponse(bot, channel, `Player hasn't entered dungeons.`);

            const cataLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"]["catacombs"]["experience"] ?? 0, "dungeoneering");
            const archLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["archer"]["experience"] ?? 0, "dungeoneering");
            const mageLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["mage"]["experience"] ?? 0, "dungeoneering");
            const bersLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["berserk"]["experience"] ?? 0, "dungeoneering");
            const tankLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["tank"]["experience"] ?? 0, "dungeoneering");
            const healLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["healer"]["experience"] ?? 0, "dungeoneering");
            
            const secrets = profile["members"][mojangProfile.id]["dungeons"]["secrets"] ?? 0;

            botResponse(bot, channel, `(${user}) | Cata: ${cataLevel} | Secrets: ${secrets} | Arch: ${archLevel} | Mage: ${mageLevel} | Tank: ${tankLevel} | Bers: ${bersLevel} | Healer: ${healLevel}`);
        })
    }
} as ChatCommand;