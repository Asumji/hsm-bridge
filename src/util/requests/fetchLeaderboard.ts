import { FetchError } from "../../interfaces/FetchError";

export default async (uuid: string, profile_id: string) => {
	try {

		const response = await fetch(
			"https://skyblock-api.matdoes.dev/player/" + uuid + "/" + profile_id + "/leaderboards",
		);
		console.log("https://skyblock-api.matdoes.dev/player/" + uuid + "/" + profile_id + "/leaderboards")

		return response.status === 200
			? ((await response.json()) as [{ name: string; positionIndex: Number; value: Number; unit: null }])
			: (response as FetchError);
	} catch (e) {
		return {
			status: 400,
			statusText: "MatDoesDev could not be reached."
		} as FetchError
	}
};
