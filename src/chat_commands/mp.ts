import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import axios from "axios";

export default {
    name: "mp",
    aliases: ["magicpower", "magicalpower", "power"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        const user = args.length === 0 ? name : args[0];
        if (typeof user != "string") return botResponse(bot, channel, "Usage: !mp <ign>");
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
                const mp = profile["members"][mojangProfile.id]["accessory_bag_storage"]["highest_magical_power"]
                const power = profile["members"][mojangProfile.id]["accessory_bag_storage"]["selected_power"].replace(/^./,(v: string) => v.toUpperCase())
                const tunings = profile["members"][mojangProfile.id]["accessory_bag_storage"]["tuning"]["slot_0"]
                const tuningsArr: string[] = []
                for (const tuning in tunings) {
                    if (tunings[tuning] == 0) continue;
                    tuningsArr.push("[" + tuning.replace(/(?:^|_)./g, (v) => v.replace("_"," ").toUpperCase()) + ": " + tunings[tuning] + "]")
                }
                botResponse(bot, channel, `(${user}) | MP: ${mp} | Power:  ${power} | Tunings: ${tuningsArr.join(", ")}`);
            })
        })
    }
} as ChatCommand;