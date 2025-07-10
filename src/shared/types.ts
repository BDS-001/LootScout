// API Error Structure
export interface ApiError {
	name: string;
	message: string;
	code: number;
	status: number;
}

// Region Types
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

export interface RegionInfo {
	name: string;
	currency: string;
	symbol: string;
}

// Steam App Parser
export interface SteamAppUrlData {
	appId: string | null;
	appName: string | null;
}

// API Parameters
export interface GgDealsApiParams {
	appId: string;
	apiKey: string;
	region: RegionCode;
}

export interface SteamApiParams {
	appId: string;
	region: RegionCode;
}

export interface CombinedGameDataParams {
	appId: string;
	apiKey: string;
	region: RegionCode;
}

// Steam Types
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

// GG.deals Game Data
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

// API Response Types
export type GgDealsApiResponse =
	| { success: true; data: Record<string, GgDealsGameData | null> }
	| { success: false; data: ApiError; error?: unknown };

export type SteamApiResponse =
	| { success: true; data: Record<string, SteamAppData> }
	| { success: false; data: ApiError; error?: unknown };

export interface CombinedGameData {
	appId: string;
	dealData: GgDealsApiResponse;
	steamStoreData: SteamApiResponse;
}

export type CombinedGameDataResponse =
	| { success: true; data: CombinedGameData }
	| { success: false; data: ApiError; error?: unknown };

// Final Simplified Response (what the content script uses)
export interface GameData {
	success: true;
	title: string;
	appId: string;
	deal: {
		currentBest: number;
		historicalBest: number;
		currency: string;
		url: string;
	};
	steam: {
		currency: string;
		initial: number;
		final: number;
		discount_percent: number;
	};
	lootScout: {
		steam: {
			status: {
				text: string;
				className: string;
			};
			rarity: {
				name: string;
				className: string;
			};
		};
		currentBest: {
			rawDiscount: number;
			discount: number;
			savings: number;
			rarity: {
				name: string;
				className: string;
			};
			isEqualToSteam: boolean;
		};
		historicalBest: {
			rawDiscount: number;
			discount: number;
			savings: number;
			rarity: {
				name: string;
				className: string;
			};
			isEqualToSteam: boolean;
		};
		hltb: {
			url: string;
		};
	};
}

export type GameDataResponse = GameData | { success: false; data: ApiError; error?: unknown };
