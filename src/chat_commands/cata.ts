import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import axios from "axios";
import { getLevel } from "../util/skillXP";

export default {
    name: "cata",
    aliases: ["dungeon", "dungeons", "catacombs"],
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
                if (profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"] == undefined) botResponse(bot, channel, `Player hasn't entered dungeons.`);

                let cataLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"]["catacombs"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"]["catacombs"]["experience"], "dungeoneering");
                let archLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["archer"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["archer"]["experience"], "dungeoneering");
                let mageLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["mage"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["mage"]["experience"], "dungeoneering");
                let bersLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["berserk"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["berserk"]["experience"], "dungeoneering");
                let tankLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["tank"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["tank"]["experience"], "dungeoneering");
                let healLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["healer"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["healer"]["experience"], "dungeoneering");

                botResponse(bot, channel, `(${user}) | Cata: ${cataLevel} | Arch: ${archLevel} | Mage: ${mageLevel} | Tank: ${tankLevel} | Bers: ${bersLevel} | Healer: ${healLevel}`);
            })
        })
    }
} as ChatCommand;