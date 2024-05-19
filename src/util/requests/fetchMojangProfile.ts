import { FetchError } from "../../interfaces/FetchError";
import { MojangProfileResponse } from "../../interfaces/MojangProfileResponse";

let cache = {} as any

setInterval(() => {
	cache = {}
},600000)

export default async (username: string) => {
	if (cache[`https://api.mojang.com/users/profiles/minecraft/${username}`]) return cache[`https://api.mojang.com/users/profiles/minecraft/${username}`]

	const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);

	if (response.status === 200) cache[`https://api.mojang.com/users/profiles/minecraft/${username}`] = ((await response.json()) as MojangProfileResponse)

	return response.status === 200 ? cache[`https://api.mojang.com/users/profiles/minecraft/${username}`] : (response as FetchError);
};
