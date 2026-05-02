declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MINECRAFT_EMAIL: string;
			MINECRAFT_PASSWORD: string;

			HYPIXEL_API_KEY: string;
			IMGUR_API_KEY: string;

			MINECRAFT_CHAT_SEPARATOR: string;

			USE_FIRST_WORD_OF_AUTHOR_NAME: "true" | "false";

			MINIMUM_NETWORK_LEVEL: string;

			REMINDER_ENABLED: "true" | "false";
			REMINDER_MESSAGE: string;
			REMINDER_FREQUENCY: string;

			DISCORD_TOKEN: string;
			DISCORD_PREFIX: string;
			DISCORD_INVITE_LINK: `discord.gg/${string}`;

			DISCORD_SERVER_ID: string;
			MEMBER_CHANNEL_ID: string;
			OFFICER_CHANNEL_ID: string;
			BLACKLIST_CHANNEL_ID: string;
			ERROR_CHANNEL_ID: string;

			BOT_OWNER_ID: string;
			STAFF_ROLE_ID: string;
			RECRUITER_ROLE_ID: string;

			PUBLIC_WEBHOOK_ID: string;
			PUBLIC_WEBHOOK_TOKEN: string;
			OFFICER_WEBHOOK_ID: string;
			OFFICER_WEBHOOK_TOKEN: string;
		}
	}
}

export {};
