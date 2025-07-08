export interface GameInfo {
	title: string;
	url: string;
	prices: {
		currentRetail: number;
		currentKeyshops: number;
		historicalRetail: number;
		historicalKeyshops: number;
		currency: string;
	};
}

export interface ApiErrorData {
	name: string;
	message: string;
	code: number;
	status: number;
}

export interface GgDealsApiParams {
	appId: string;
	apiKey: string;
	region: RegionCode;
}

export interface GgDealsGameData {
	title: string;
	url: string;
	prices: {
		currentRetail: number;
		currentKeyshops: number;
		historicalRetail: number;
		historicalKeyshops: number;
		currency: string;
	};
}

export type GgDealsApiResponse =
	| { success: true; data: Record<string, GgDealsGameData | null> }
	| { success: false; data: ApiErrorData; error?: unknown };

export type NormalizedGgDealsApiResponse =
	| { success: true; data: GgDealsGameData | null }
	| { success: false; data: ApiErrorData; error?: unknown };

export type GameDataApiResponse =
	| { success: true; data: Record<string, GameInfo | null> }
	| { success: false; data: ApiErrorData; error?: unknown };

export interface SteamAppUrlData {
	appId: string | null;
	appName: string | null;
}

export interface RegionInfo {
	name: string;
	currency: string;
	symbol: string;
}

export type RegionCode =
	| 'au'
	| 'be'
	| 'br'
	| 'ca'
	| 'ch'
	| 'de'
	| 'dk'
	| 'es'
	| 'eu'
	| 'fi'
	| 'fr'
	| 'gb'
	| 'ie'
	| 'it'
	| 'nl'
	| 'no'
	| 'pl'
	| 'se'
	| 'us';

export interface SteamApiParams {
	appId: string;
	region: RegionCode;
}

export interface SteamPriceOverview {
	currency: string;
	initial: number;
	final: number;
	discount_percent: number;
	initial_formatted?: string;
	final_formatted?: string;
}

export interface SteamAppData {
	success: boolean;
	data?: {
		name: string;
		steam_appid: number;
		is_free: boolean;
		price_overview?: SteamPriceOverview;
	};
}

export type SteamApiResponse =
	| { success: true; data: Record<string, SteamAppData> }
	| { success: false; data: ApiErrorData; error?: unknown };

export type NormalizedSteamApiResponse =
	| { success: true; data: SteamAppData | null }
	| { success: false; data: ApiErrorData; error?: unknown };

export interface CombinedGameDataParams {
	appId: string;
	apiKey: string;
	region: RegionCode;
}

export interface CombinedGameData {
	appId: string;
	ggDealsData: GgDealsApiResponse;
	steamStoreData: SteamApiResponse;
}

export interface NormalizedCombinedGameData {
	appId: string;
	ggDealsData: NormalizedGgDealsApiResponse;
	steamStoreData: NormalizedSteamApiResponse;
}

export type CombinedGameDataResponse =
	| { success: true; data: CombinedGameData }
	| { success: false; data: ApiErrorData; error?: unknown };

export type NormalizedCombinedGameDataResponse =
	| { success: true; data: NormalizedCombinedGameData }
	| { success: false; data: ApiErrorData; error?: unknown };
