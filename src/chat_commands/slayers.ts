import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import axios from "axios";
import { getLevel } from "../util/skillXP";

export default {
    name: "slayers",
    aliases: ["slayer"],
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
        })
    }
} as ChatCommand;