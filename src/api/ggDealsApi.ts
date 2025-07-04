interface GameInfo {
	title: string;
	url: string;
	prices: {
		currentRetail: string;
		currentKeyshops: string;
		historicalRetail: string;
		historicalKeyshops: string;
		currency: string;
	};
}

interface ApiErrorData {
	name: string;
	message: string;
	code: number;
	status: number;
}

type GameDataApiResponse =
	| { success: true; data: Record<string, GameInfo | null> }
	| { success: false; data: ApiErrorData; error?: unknown };

export default async function fetchGameData(
	appId: string,
	apiKey: string
): Promise<GameDataApiResponse> {
	try {
		const result = await fetch(
			`https://api.gg.deals/v1/prices/by-steam-app-id/?ids=${appId}&key=${apiKey}&region=ca`
		);
		return result.json();
	} catch (error) {
		return {
			success: false,
			data: {
				name: 'Network Error',
				message: 'Error fetching data from GG Deals',
				code: 0,
				status: 0,
			},
		};
	}
}
