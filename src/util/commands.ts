import fs from "node:fs"
import Bot from "../classes/Bot";
import { ChatCommand } from "../interfaces/Command";

const commands: ChatCommand[] = []
fs.readdirSync("./dist/chat_commands").forEach(file => {
	if (file.endsWith(".js")) {
		const command = require(`C:/Users/timir/Desktop/bridge-master/bridge-master/dist/chat_commands/${file}`).default as ChatCommand;
		commands.push(command);
	}
});

export function botResponse(bot: Bot, channel: "Guild" | "Officer", text: string) {
	setTimeout(() => {
		bot.sendGuildMessage(channel == "Guild" ? "gc" : "oc", text);
		channel == "Guild"
			? bot.memberChannel?.send(text.replaceAll(" | ", "\n"))
			: bot.officerChannel?.send(text.replaceAll(" | ", "\n"));
	}, 300);
}

export async function runCommand(bot: Bot, chat: "Guild" | "Officer", s: string, name?: string) {
	const args = s.split(" ").filter(v => v !== "" && v !== "undefined");
	const commandName = args.shift()?.toLowerCase() ?? "";

	for (const command of commands) {
		if (command.name === commandName || command.aliases.includes(commandName)) {
			await command.run(bot, chat, args, name);
			return;
		}
		if (commands.indexOf(command) === commands.length - 1) {
			botResponse(bot, chat, `Unknown command! Available Commands: !${commands.map(c => c.name).join(", !")}`);
		}
	}
}
