import { Message } from "discord.js";
import { Event } from "../../interfaces/Event";
import emojis from "../../util/emojis";
import axios from "axios";
import { runCommand } from "../../util/commands";
import _filter from "../../util/blacklist/_filter.json"

export let latestMessage : any[] = []
export default {
	name: "messageCreate",
	runOnce: false,
	run: async (bot, message: Message) => {
		if (
			message.author.bot ||
			message.member === null ||
			(message.channel != bot.memberChannel && message.channel != bot.officerChannel)
		)
			return;

		let filterRegex = new RegExp(_filter.words.join("|"))

		if (message.content.startsWith("!")) {
			const args = message.content.split(" ")
			if (args[0]) {
				runCommand(bot,message.channel == bot.memberChannel ? "Guild" : "Officer",args[0]?.replace("!",""),args[1],undefined)
			}
		}

		if ((" "+message.content+" ").match(filterRegex)) {
			await message.channel.send(
				`${emojis.warning} ${message.author.username}, you may not use profane language!`,
			);
			bot.logger.warn(`Comment blocked: ${message.content}`);
			bot.sendToDiscord(
				"oc",
				`${emojis.warning} <@${message.author.id}> tried to say "${message.content}" but was blocked. This message was not sent to Hypixel.`,
			);
		} else {
			const name =
				process.env.USE_FIRST_WORD_OF_AUTHOR_NAME === "true"
					? message.member.displayName.split(" ")[0]
					: message.member.displayName;
				
			message.mentions.repliedUser != null
				? message.content = `${name} replying to ${message.mentions.repliedUser.bot == false 
					? message.guild?.members.cache.get(message.mentions.repliedUser.id)?.displayName
					: message.mentions.repliedUser.username
				}${bot.chatSeparator} ${message.content.replace(/\r?\n|\r/g, " ")}`
				: message.content = `${name}${bot.chatSeparator} ${message.content.replace(/\r?\n|\r/g, " ")}`;

			if (message.content.length > 217) {
				await message.react(emojis.error)
				await message.channel.send(`Your message is too long! \`${message.content.length}/217\``);
				return;
			}

			if (message.attachments.size > 0) {
				await axios({
					url: "https://api.imgur.com/3/image",
					method: "POST",
					headers: {
						Authorization: `Client-ID d30c6dc9941b52b`,
					},
					data: {
						image: message.attachments.first()?.url,
						type: 'url'
					},
					responseType: "json"
				}).then(res => {
					setTimeout(() => {
						bot.logger.info(res.data.data.link)
						bot.sendGuildMessage(message.channel.id === bot.memberChannel?.id ? "gc" : "oc", res.data.data.link)
					},500)
				})
			}
			latestMessage = [message.channel.id === bot.memberChannel?.id ? "gc" : "oc",message]
			bot.sendGuildMessage(message.channel.id === bot.memberChannel?.id ? "gc" : "oc", message.content);
		}
	},
} as Event;
