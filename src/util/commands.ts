import axios from "axios";
import Bot from "../classes/Bot";
import fetchMojangProfile from "./requests/fetchMojangProfile";
import isFetchError from "./requests/isFetchError";
import logError from "./logError";
import { getLevel } from "./skillXP";
import fetchHypixelPlayerProfile from "./requests/fetchHypixelPlayerProfile";
import { shortenNumber } from "./shortenNumber";

export function botResponse(bot:Bot, channel: "Guild"|"Officer", text:string) {
    bot.sendGuildMessage(channel == "Guild" ? "gc" : "oc",text)
    channel == "Guild" ? bot.memberChannel?.send(text) : bot.officerChannel?.send(text)
}

export async function runCommand(bot:Bot,chat:"Guild"|"Officer",command:string,name:string,args:any) {
    const mojangProfile = await fetchMojangProfile(args != undefined ? args[0] : name)

    if (isFetchError(mojangProfile)) {
        botResponse(bot,chat,"API could not be reached.")
        return;
    }

    await axios.get("https://api.hypixel.net/v2/skyblock/profiles?uuid="+mojangProfile.id+"&key="+process.env.HYPIXEL_API_KEY).then(res => {
        res.data.profiles.forEach(async (profile: any) => {
            if (profile.selected != true) return

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
                    botResponse(bot,chat,`Cata: ${cataLevel} | Arch: ${archLevel} | Mage: ${mageLevel} | Tank: ${tankLevel} | Bers: ${bersLevel} | Healer: ${healerLevel}`)
                    break;
                case "skills":
                    const hypixelProfile = await fetchHypixelPlayerProfile(name)
                    if (isFetchError(hypixelProfile)) {
                        logError(new Error("API unresponsive"),hypixelProfile.statusText)
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

                    botResponse(bot,chat,`Farming: ${farming} | Mining: ${mining} | Foraging: ${foraging} | Combat: ${combat} | Alchemy: ${alchemy} | Carpentry: ${carpentry} | Fishing: ${fishing} | Enchanting: ${enchanting} | Taming: ${taming} | Social: ${social} | Runecrafting: ${runecrafting} | SkillAvg: ${skillAvg.toFixed(2)}`)
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

                    botResponse(bot,chat,`Zombie: ${zombie} | Spider: ${spider} | Wolf: ${wolf} | Enderman: ${enderman} | Blaze: ${blaze} | Vamp: ${vamp}`)
                    break;
                case "purse":
                    botResponse(bot,chat,`Purse: ${shortenNumber(profile["members"][mojangProfile.id]["currencies"]["coin_purse"])} | Bank: ${shortenNumber(profile["banking"]["balance"])}`)
                    break;
                default:
                    botResponse(bot,chat,"Unknown command. Available Commands: !cata, !skills, !slayers")
            }
        })
    }).catch(e =>{
        logError(new Error("API unresponsive"),e)
        botResponse(bot,chat,"API could not be reached.")
        return;
    })
}