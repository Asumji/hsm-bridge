import { FetchError } from "../../interfaces/FetchError";
import { HypixelPlayerResponse } from "../../interfaces/HypixelPlayerResponse";

let cache = {} as any

setInterval(() => {
	cache = {}
},600000)

export default async (username: string) => {
	if (cache[`https://api.hypixel.net/v2/player?key=${process.env.HYPIXEL_API_KEY}&name=${username}`]) return cache[`https://api.hypixel.net/v2/player?key=${process.env.HYPIXEL_API_KEY}&name=${username}`] as HypixelPlayerResponse

	const response = await fetch(
		`https://api.hypixel.net/v2/player?key=${process.env.HYPIXEL_API_KEY}&name=${username}`,
	);

	if (response.status === 429) return ({
			status: 429,
			statusText: "Rate Limit: "+response.headers.get("RateLimit-Remaining")+"/"+response.headers.get("RateLimit-Limit")+"\nResets in: "+response.headers.get("RateLimit-Reset")+" seconds"
		} as FetchError)

	if (response.status === 200) cache[`https://api.hypixel.net/v2/player?key=${process.env.HYPIXEL_API_KEY}&name=${username}`] = ((await response.json()) as any).player as HypixelPlayerResponse

	return response.status === 200
		? cache[`https://api.hypixel.net/v2/player?key=${process.env.HYPIXEL_API_KEY}&name=${username}`] // eslint-disable-line @typescript-eslint/no-explicit-any
		: (response as FetchError);
};
