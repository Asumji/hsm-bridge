import { ActivityType, ColorResolvable, EmbedBuilder, IntentsBitField, TextChannel, WebhookClient } from "discord.js";
import { BotEvents, createBot } from "mineflayer";
import { Command } from "../interfaces/Command";
import Discord from "./Client";
import { Event } from "../interfaces/Event";
import EventEmitter from "events";
import consola from "consola";
import isObjKey from "../util/isObjKey";
import logError from "../util/logError";
import path from "path";
import recursiveWalkDir from "../util/recursiveWalkDir";
import regex from "../util/regex";

class Bot {
	public readonly logger = consola;

	public readonly discord = new Discord({
		allowedMentions: { parse: ["users", "roles"], repliedUser: true },
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.MessageContent,
		],
	});
	public readonly botPrefix = process.env.DISCORD_PREFIX ?? ")";
	public readonly chatSeparator = process.env.MINECRAFT_CHAT_SEPARATOR ?? ">";
	public memberChannel?: TextChannel;
	public officerChannel?: TextChannel;

	public onlineCount = 0;
	public totalCount = 125;
	public currentlyOnline = "";
	public readonly mineflayer = createBot({
		username: process.env.MINECRAFT_EMAIL,
		password: process.env.MINECRAFT_PASSWORD,
		host: "stuck.hypixel.net",
		auth: "microsoft",
		version: "1.8.9",
		logErrors: true,
		hideErrors: true,
		checkTimeoutInterval: 30000,
		defaultChatPatterns: false,
	});

	constructor() {
		try {
			this.start();
		} catch (error) {
			this.logger.error(error);
		}
	}

	public async sendToDiscord(
		channel: "gc" | "oc",
		content: string,
		color: ColorResolvable = 0x2f3136,
		padMessage = false,
		username: string = "",
		message: string = "",
		guildMessage = false,
		guildRank: string = "",
	) {
		const embed = new EmbedBuilder()
			.setDescription(padMessage ? `${"-".repeat(54)}\n${content}\n${"-".repeat(54)}` : content)
			.setColor(color);

		if (guildMessage) {
			const webhookClient =
				channel == "gc"
					? new WebhookClient({
							id: "1219013672438071418",
							token: "Gt8P8T9MmIKDExC1mH_sxzVWMzuFuhcr588tGzM82xJmqSNPNsm3vGi2UaopA7JHh_R9",
					  })
					: new WebhookClient({
							id: "1222258212733059204",
							token: "TfC87YnUi75lc5BtDInnwEBCDjj0dHYezczpVPzNRd-qfXriGKbdrdd2F46VGjc1c7Pj",
					  });
			
			let date = new Date(Date.now())
			if (date.getMonth() == 3 && date.getDate() == 1) {
				message = message.replace(/[rR]/g, "w").replace(/[lL]/g, "w")
				let emotes = [">///<", "UwU", "OwO", "U~U", ">-<", ">~<", ":3", "x3", "^-^", "^~^", ";w;", ";;w;;", "^w^", ">w<", "QwQ", "Q~Q", "(｡ᴜ‿‿ᴜ｡)"]
				if (Math.round(Math.random()*50) == 50) message += " " + emotes[Math.round(Math.random()*emotes.length-1)]
			}

			webhookClient.send({
				content: message,
				username: guildRank != undefined ? username + " " + guildRank : username,
				avatarURL: "https://mc-heads.net/avatar/" + username,
			});
			return;
		}

		return channel === "gc"
			? await this.memberChannel?.send({ embeds: [embed] })
			: await this.officerChannel?.send({ embeds: [embed] });
	}

	public sendGuildMessage(channel: "gc" | "oc", message: string) {
		let date = new Date(Date.now())
		if (date.getMonth() == 3 && date.getDate() == 1) {
			message = message.replace(/[rR]/g, "w").replace(/[lL]/g, "w")
			let emotes = [">///<", "UwU", "OwO", "U~U", ">-<", ">~<", ":3", "x3", "^-^", "^~^", ";w;", ";;w;;", "^w^", ">w<", "QwQ", "Q~Q", "(｡ᴜ‿‿ᴜ｡)"]
			if (Math.round(Math.random()*50) == 50) message += " " + emotes[Math.round(Math.random()*emotes.length-1)]
		}

		this.executeCommand(`/${channel} ${message}`);
	}

	public executeCommand(message: string) {
		this.mineflayer.chat(message);
	}

	public async executeTask(task: string) {
		let listener: BotEvents["message"];

		await new Promise((resolve, reject) => {
			listener = (message) => {
				const str = message.toString();
				const motd = message.toMotd();
				const matches = motd.match(/^(.+)§c(.+)§r$/) ?? motd.match(/^§c(.+)$/);

				if (matches?.length && !str.toLowerCase().includes("limbo")) {
					reject(str);
				}
			};

			this.mineflayer.chat(task);
			this.mineflayer.on("message", listener);

			setTimeout(() => {
				resolve(undefined);
			}, 300);
		}).finally(() => {
			this.mineflayer.removeListener("message", listener);
		});
	}

	public sendToLimbo() {
		for (let i = 0; i < 15; i++) {
			this.executeCommand("////")	
		}
	}

	public setStatus() {
		const plural = this.onlineCount - 1 !== 1;

		if (this.discord.isReady()) {
			this.discord.user.setActivity(`${this.onlineCount - 1} online player${plural ? "s" : ""}`, {
				type: ActivityType.Watching,
			});
		}
	}

	private async loadCommands(dir: string) {
		const callback = async (currentDir: string, file: string) => {
			if (!(file.endsWith(".ts") || file.endsWith(".js")) || file.endsWith(".d.ts")) return;

			const command = (await import(path.join(currentDir, file))).default as Command;

			if (!command.data) {
				console.warn(`The command ${path.join(currentDir, file)} doesn't have a name!`);
				return;
			}

			if (!command.run) {
				console.warn(`The command ${command.data.name} doesn't have an executable function!`);
				return;
			}

			this.discord.commands.set(command.data.name, command);
		};

		await recursiveWalkDir(path.join(__dirname, dir), callback, "Error while loading commands: ");
	}

	private async loadEvents(dir: string, emitter: EventEmitter) {
		const callback = async (currentDir: string, file: string) => {
			if (!(file.endsWith(".ts") || file.endsWith(".js")) || file.endsWith(".d.ts")) return;

			const { name, runOnce, run } = (await import(path.join(currentDir, file))).default as Event;

			if (!name) {
				console.warn(`The event ${path.join(currentDir, file)} doesn't have a name!`);
				return;
			}

			if (!run) {
				console.warn(`The event ${name} doesn't have an executable function!`);
				return;
			}

			if (isObjKey(name, regex)) {
				this.mineflayer.addChatPattern(name.replace("chat:", ""), regex[name], {
					repeat: true,
					parse: true,
				});
			}

			if (runOnce) {
				emitter.once(name, run.bind(null, this));
				return;
			}

			emitter.on(name, (...args) => {
				run(this, ...args.flat(2));
			});
		};

		await recursiveWalkDir(path.join(__dirname, dir), callback, "Error while loading events: ");
	}

	private async start() {
		this.mineflayer.setMaxListeners(20);
		await Promise.all([
			this.loadCommands("../commands"),
			this.loadEvents("../events/discord", this.discord),
			this.loadEvents("../events/mineflayer", this.mineflayer),
		]);

		await this.discord.login(process.env.DISCORD_TOKEN);
	}
}

process.on("uncaughtException", logError).on("unhandledRejection", logError);

export default Bot;
