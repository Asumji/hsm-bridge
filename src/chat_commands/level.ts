import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import axios from "axios";

export default {
    name: "level",
    aliases: ["sblevel", "sbxp", "sblvl"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        const user = args.length === 0 ? name : args[0];
        if (typeof user != "string") return botResponse(bot, channel, "Usage: !level <ign>");
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
                botResponse(bot, channel, `(${user}) | Level: ${profile["members"][mojangProfile.id]["leveling"]["experience"] / 100}`);
            })
        })
    }
} as ChatCommand;