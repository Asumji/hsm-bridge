import { FetchError } from "../../interfaces/FetchError";
import { HypixelGuildResponse } from "../../interfaces/HypixelGuildReponse";

export default async (uuid: string) => {
	const response = await fetch(`https://api.hypixel.net/guild?key=${process.env.HYPIXEL_API_KEY}&player=${uuid}`, {
		headers: {
			"API-Key": process.env.HYPIXEL_API_KEY,
			"User-Agent": "HSM Bridge 1.0.0"
		}
	});

	return response.status === 200
		? (((await response.json()) as any).guild as HypixelGuildResponse) // eslint-disable-line @typescript-eslint/no-explicit-any
		: (response as FetchError);
};
