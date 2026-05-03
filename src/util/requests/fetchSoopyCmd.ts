import { FetchError } from "../../interfaces/FetchError";

export default async (cmd:string,username:string) => {
	const response = await fetch(`https://soopy.dev/api/soopyv2/botcommand?m=${cmd}&u=${username}`, {
		headers: {
			"API-Key": process.env.HYPIXEL_API_KEY,
			"User-Agent": "HSM Bridge 1.0.0"
		}
	});

	return response.status === 200 ? ((await response.text()) as any) : (response as FetchError);
};
