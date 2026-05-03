import { FetchError } from "../../interfaces/FetchError";

export default async (uuid: string) => {
	const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?uuid=${uuid}&key=${process.env.HYPIXEL_API_KEY}`, {
		headers: {
			"API-Key": process.env.HYPIXEL_API_KEY,
			"User-Agent": "HSM Bridge 1.0.0"
		}
	});

	return response.status === 200 ? ((await response.json()) as any) : (response as FetchError);
};
