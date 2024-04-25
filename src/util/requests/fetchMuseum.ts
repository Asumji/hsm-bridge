import { FetchError } from "../../interfaces/FetchError";

export default async (profile_id: string) => {
	const response = await fetch(
		`https://api.hypixel.net/v2/skyblock/museum?key=${process.env.HYPIXEL_API_KEY}&profile=${profile_id}`,
	);

	return response.status === 200 ? ((await response.json()) as any) : (response as FetchError);
};
