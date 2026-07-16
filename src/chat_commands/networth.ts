import { botResponse } from "../util/commands";
import { ChatCommand } from "../interfaces/Command";
import Bot from "../classes/Bot";
import fetchMojangProfile from "../util/requests/fetchMojangProfile";
import isFetchError from "../util/requests/isFetchError";
import fetchMuseum from "../util/requests/fetchMuseum";
import logError from "../util/logError";
import { ProfileNetworthCalculator  } from "skyhelper-networth";
import { shortenNumber } from "../util/shortenNumber";
import fetchSkyblockProfiles from "../util/requests/fetchSkyblockProfiles";

export default {
    name: "networth",
    aliases: ["nw"],
    run: async (bot: Bot, channel: "Guild" | "Officer", args: string[], name?: string) => {
        console.log(args, name)
        const user = args.length === 0 ? name : args[0];
        if (typeof user != "string") return botResponse(bot, channel, "Usage: !networth [ign]");
        const mojangProfile = await fetchMojangProfile(user as string);
        if (isFetchError(mojangProfile)) return botResponse(bot, channel, "Mojang API could not be reached. Is " + user + " the correct name?");
        const skyblockProfiles = await fetchSkyblockProfiles(mojangProfile.id);
        if (isFetchError(skyblockProfiles)) return botResponse(bot, channel, "Skyblock API could not be reached.");
        
        skyblockProfiles.profiles.forEach(async (profile: any) => {
            if (profile.selected != true) return;
            const museum = await fetchMuseum(profile.profile_id);

            if (isFetchError(museum)) {
                logError(new Error("API unresponsive" + museum.statusText), museum.statusText);
                botResponse(bot, channel, "API could not be reached.");
                return;    
            }
            const networthManager = new ProfileNetworthCalculator(profile["members"][mojangProfile.id], museum["members"][mojangProfile.id], profile.banking?.balance || 0);
            const networth = await networthManager.getNetworth();

            if (networth.noInventory) return botResponse(bot, channel, "Inventory API is turned off");

            botResponse(bot, channel, `(${user}) | Networth: ${shortenNumber(networth.networth)} | Unsoulbound Networth: ${shortenNumber(networth.unsoulboundNetworth)}`);
        })
    }
} as ChatCommand;