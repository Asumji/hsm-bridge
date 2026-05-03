import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import fetchSkyblockProfiles from "../util/requests/fetchSkyblockProfiles";

export default {
    name: "floor",
    aliases: ["pb", "comps", "runs"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        const floors = {
            "m": "master_catacombs",
            "f": "catacombs"
        }

        const floor = args[0]?.toLowerCase();
        const user = args.length < 2 ? name : args[1];
        if (typeof user != "string" || typeof floor != "string") return botResponse(bot, channel, "Usage: !floor <floor> <ign>");
        const mojangProfile = await fetchMojangProfile(user as string);
        if (isFetchError(mojangProfile)) return botResponse(bot, channel, "Mojang API could not be reached. Is " + user + " the correct name?");
        const skyblockProfiles = await fetchSkyblockProfiles(mojangProfile.id);
        if (isFetchError(skyblockProfiles)) return botResponse(bot, channel, "Skyblock API could not be reached.");
        
        skyblockProfiles.profiles.forEach(async (profile: any) => {
            if (profile.selected != true) return;
            if (profile["members"][mojangProfile.id]["dungeons"] == undefined) return botResponse(bot, channel, `Player hasn't entered dungeons.`);
            
            const floorData = profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"][floors[floor[0] as keyof typeof floors]]
            
            if (floorData == undefined) return botResponse(bot, channel, "The player doesn't seem to have played that floor.");

            const pbSPlus = (profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"][floors[floor[0] as keyof typeof floors]]["fastest_time_s_plus"][Number(floor[1])] ?? 0)/1000;
            const comps = profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"][floors[floor[0] as keyof typeof floors]]["tier_completions"][Number(floor[1])] ?? 0;

            botResponse(bot, channel, `(${user}) | S+ PB: ${Math.floor(pbSPlus / 60)}m ${Math.round(pbSPlus % 60)}s | Comps: ${comps}`);
        })
    }
} as ChatCommand;