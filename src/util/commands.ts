import axios from "axios";
import Bot from "../classes/Bot";
import fetchMojangProfile from "./requests/fetchMojangProfile";
import isFetchError from "./requests/isFetchError";
import logError from "./logError";
import { getLevel } from "./skillXP";
import fetchHypixelPlayerProfile from "./requests/fetchHypixelPlayerProfile";
import { shortenNumber } from "./shortenNumber";
import { getNetworth } from "skyhelper-networth"
import fetchMuseum from "./requests/fetchMuseum";
import { Commands } from "../interfaces/Command";

const commands: Commands = {
    api: {
        commands: ["cata", "skills", "slayers", "bank", "level", "networth", "hotm"],
        aliases: {
            skill: "skills",
            slayer: "slayers",
            coins: "bank",
            purse: "bank",
            nw: "networth",
            powder: "hotm"
        }
    },
    text: {
        commands: ["mf","active"],
        aliases: {
            activerole: "active"
        }
    }
}

export function botResponse(bot:Bot, channel: "Guild"|"Officer", text:string) {
    setTimeout(() => {
        bot.sendGuildMessage(channel == "Guild" ? "gc" : "oc",text)
        channel == "Guild" ? bot.memberChannel?.send(text.replaceAll(" | ","\n")) : bot.officerChannel?.send(text.replaceAll(" | ","\n"))
    },300)
}

export async function runCommand(bot:Bot,chat:"Guild"|"Officer",command:string,name:any,args:any) {
    if (commands.api.commands.includes(command) || commands.api.commands.includes(commands.api.aliases[command])) {
        if (name == undefined && args == undefined) return botResponse(bot,chat,"Missing some Arguments. Usage: !<command> <name>")
        if (commands.api.commands.includes(commands.api.aliases[command])) command = commands.api.aliases[command]

        const mojangProfile = await fetchMojangProfile(args != undefined ? args[0] : name)

        if (isFetchError(mojangProfile)) {
            logError(new Error("FetchError" + mojangProfile.statusText), mojangProfile.statusText)
            botResponse(bot,chat,"Mojang API could not be reached. Is " + args != undefined ? args[0] : name + " the correct name?")
            return;
        }
        await axios.get("https://api.hypixel.net/v2/skyblock/profiles?uuid="+mojangProfile.id+"&key="+process.env.HYPIXEL_API_KEY).then(res => {
            res.data.profiles.forEach(async (profile: any) => {
                if (profile.selected != true) return
                try {
                    switch(command) {
                        case "cata":
                            if (profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"] == undefined ) {
                                botResponse(bot,chat,`Player hasn't entered dungeons.`)
                                break;
                            }
                            let cataLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"]["catacombs"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["dungeon_types"]["catacombs"]["experience"],"dungeoneering")
                            let archLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["archer"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["archer"]["experience"],"dungeoneering")
                            let mageLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["mage"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["mage"]["experience"],"dungeoneering")
                            let tankLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["tank"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["tank"]["experience"],"dungeoneering")
                            let bersLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["berserk"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["berserk"]["experience"],"dungeoneering")
                            let healerLevel = getLevel(profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["healer"]["experience"] == undefined ? 0 : profile["members"][mojangProfile.id]["dungeons"]["player_classes"]["healer"]["experience"],"dungeoneering")
                            botResponse(bot,chat,`(${args != undefined ? args[0] : name}) | Cata: ${cataLevel} | Arch: ${archLevel} | Mage: ${mageLevel} | Tank: ${tankLevel} | Bers: ${bersLevel} | Healer: ${healerLevel}`)
                            break;
                        case "skills":
                            const hypixelProfile = await fetchHypixelPlayerProfile(args != undefined ? args[0] : name)
                            if (isFetchError(hypixelProfile)) {
                                logError(new Error("API unresponsive " + hypixelProfile.statusText),hypixelProfile.statusText)
                                botResponse(bot,chat,"API could not be reached.")
                                break;
                            }
                            
                            let farmingCap = profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"] == undefined ? 50 : 50+profile["members"][mojangProfile.id]["jacobs_contest"]["perks"]["farming_level_cap"]
                            let tamingCap = hypixelProfile.achievements.skyblock_domesticator == undefined ? 0 : hypixelProfile.achievements.skyblock_domesticator

                            let farming = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FARMING"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FARMING"],"farming",farmingCap)
                            let mining = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_MINING"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_MINING"],"mining")
                            let foraging = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FORAGING"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FORAGING"],"foraging")
                            let combat = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_COMBAT"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_COMBAT"],"combat")
                            let alchemy = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ALCHEMY"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ALCHEMY"],"alchemy")
                            let carpentry = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_CARPENTRY"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_CARPENTRY"],"carpentry")
                            let fishing = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FISHING"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_FISHING"],"fishing")
                            let enchanting = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ENCHANTING"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_ENCHANTING"],"enchanting")
                            let taming = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_TAMING"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_TAMING"],"taming",tamingCap)
                            let social = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_SOCIAL"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_SOCIAL"],"social")
                            let runecrafting = getLevel(profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_RUNECRAFTING"] == undefined ? 0 : profile["members"][mojangProfile.id]["player_data"]["experience"]["SKILL_RUNECRAFTING"],"runecrafting")

                            let skillAvg = (farming+mining+foraging+combat+alchemy+carpentry+fishing+enchanting+taming)/9

                            botResponse(bot,chat,`(${args != undefined ? args[0] : name}) | Farming: ${farming} | Mining: ${mining} | Foraging: ${foraging} | Combat: ${combat} | Alchemy: ${alchemy} | Carpentry: ${carpentry} | Fishing: ${fishing} | Enchanting: ${enchanting} | Taming: ${taming} | Social: ${social} | Runecrafting: ${runecrafting} | SkillAvg: ${skillAvg.toFixed(2)}`)
                            break;
                        case "slayers":
                            let zombie = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["zombie"]
                                zombie = getLevel(zombie.xp == undefined ? 0 : zombie.xp,"zombie")
                            let spider = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["spider"]
                                spider = getLevel(spider.xp == undefined ? 0 : spider.xp,"spider")
                            let wolf = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["wolf"]
                                wolf = getLevel(wolf.xp == undefined ? 0 : wolf.xp,"wolf")
                            let enderman = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["enderman"]
                                enderman = getLevel(enderman.xp == undefined ? 0 : enderman.xp,"enderman")
                            let blaze = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["blaze"]
                                blaze = getLevel(blaze.xp == undefined ? 0 : blaze.xp,"blaze")
                            let vamp = profile["members"][mojangProfile.id]["slayer"]["slayer_bosses"]["vampire"]
                                vamp = getLevel(vamp.xp == undefined ? 0 : vamp.xp,"vamp")

                            botResponse(bot,chat,`(${args != undefined ? args[0] : name}) | Zombie: ${zombie} | Spider: ${spider} | Wolf: ${wolf} | Enderman: ${enderman} | Blaze: ${blaze} | Vamp: ${vamp}`)
                            break;
                        case "bank":
                            botResponse(bot,chat,`(${args != undefined ? args[0] : name}) | Purse: ${shortenNumber(profile["members"][mojangProfile.id]["currencies"]["coin_purse"])} | Bank: ${shortenNumber(profile["banking"]["balance"])}`)
                            break;
                        case "level":
                            botResponse(bot,chat,`(${args != undefined ? args[0] : name}) | Level: ${profile["members"][mojangProfile.id]["leveling"]["experience"]/100}`)
                            break;
                        case "networth":
                            const museum = await fetchMuseum(profile.profile_id)

                            if (isFetchError(museum)) {
                                logError(new Error("API unresponsive" + museum.statusText),museum.statusText)
                                botResponse(bot,chat,"API could not be reached.")
                                break;
                            }

                            const networth = await getNetworth(profile["members"][mojangProfile.id], profile.banking?.balance || 0, {
                                v2Endpoint: true,
                                onlyNetworth: true,
                                museumData: museum["members"][mojangProfile.id],
                            });
                            
                            if (networth.noInventory) {
                                botResponse(bot,chat,"Inventory API is turned off")
                                break;
                            }
                            
                            botResponse(bot,chat,`(${args != undefined ? args[0] : name}) | Networth: ${shortenNumber(networth.networth)} | Unsoulbound Networth: ${shortenNumber(networth.unsoulboundNetworth)}`)
                            break;
                        case "hotm":
                            let hotm = getLevel(profile["members"][mojangProfile.id]["mining_core"]["experience"],"hotm")
                            let mithril = profile["members"][mojangProfile.id]["mining_core"]["powder_mithril"]+profile["members"][mojangProfile.id]["mining_core"]["powder_spent_mithril"]
                            let gemstone = profile["members"][mojangProfile.id]["mining_core"]["powder_gemstone"]+profile["members"][mojangProfile.id]["mining_core"]["powder_spent_gemstone"]
                            let glacite = profile["members"][mojangProfile.id]["mining_core"]["powder_glacite"]+profile["members"][mojangProfile.id]["mining_core"]["powder_spent_glacite"]
                            
                            botResponse(bot,chat,`(${args != undefined ? args[0] : name}) | HOTM: ${hotm} | Mithril: ${shortenNumber(mithril.toString() == "NaN" ? 0 : mithril)} | Gemstone: ${shortenNumber(gemstone.toString() == "NaN" ? 0 : gemstone)} | Glacite: ${shortenNumber(glacite.toString() == "NaN" ? 0 : glacite)}`)
                            break;
                        default:
                            botResponse(bot,chat,"Unknown Command although it should exist. If this happens go spam asumji on discord.")
                            logError(new Error("Falsely Unknown Command " + command))
                    }
                } catch (e) {
                    botResponse(bot,chat,"Something went wrong. API might be off.")
                    logError(new Error("Command Error "+e))
                }
            })
        }).catch(e =>{
            logError(new Error("API unresponsive "+e),e)
            botResponse(bot,chat,"API could not be reached.")
            return;
        })
    } else if (commands.text.commands.includes(command) || commands.text.commands.includes(commands.text.aliases[command])) {
        if (commands.text.commands.includes(commands.text.aliases[command])) command = commands.text.aliases[command]

        switch (command) {
            case "mf":
                botResponse(bot,chat,"booster cookie gives 15, community center upgrades gives 5, cake gives 1, scorched power crystal gives 1 + t5 beacon gives 5 and lastly necrons ladder gives 1 (for max 28mf)")
                break;
            case "active":
                botResponse(bot,chat,"The top 3 players every week in guild xp get the active guild rank and discord role.")
                break;
            default:
                botResponse(bot,chat,"Unknown Command although it should exist. If this happens go spam asumji on discord.")
                logError(new Error("Falsely Unknown Command " + command))
        }
    } else {
        botResponse(bot,chat,"Unknown command. Available Commands: !" + commands.api.commands.join(", !") + ", !" + commands.text.commands.join(", !"))
    }
}