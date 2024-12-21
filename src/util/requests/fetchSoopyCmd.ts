import { FetchError } from "../../interfaces/FetchError";

export default async (cmd:string,username:string) => {
	const response = await fetch(
		`https://soopy.dev/api/soopyv2/botcommand?m=${cmd}&u=${username}`,
	);

	return response.status === 200 ? ((await response.text()) as any) : (response as FetchError);
};
