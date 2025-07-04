export interface GameInfo {
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

export interface ApiErrorData {
	name: string;
	message: string;
	code: number;
	status: number;
}

export type GameDataApiResponse =
	| { success: true; data: Record<string, GameInfo | null> }
	| { success: false; data: ApiErrorData; error?: unknown };

export interface SteamAppUrlData {
	appId: string | null;
	appName: string | null;
}
