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

// ISP-compliant interfaces
export interface ApiCredentials {
	apiKey: string;
}

export interface GameIdentifier {
	appId: string;
}

export interface LocalizationParams {
	region: RegionCode;
}

// Composed interface for backward compatibility
export interface CombinedGameDataParams
	extends ApiCredentials,
		GameIdentifier,
		LocalizationParams {}

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

// ISP-compliant GameData interfaces
export interface GameBasicInfo {
	success: true;
	title: string;
	appId: string;
}

export interface RarityInfo {
	name: string;
	className: string;
}

export interface DealStatus {
	text: string;
	className: string;
}

export interface GamePricing {
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
}

export interface GameAnalytics {
	lootScout: {
		steam: {
			status: DealStatus;
			rarity: RarityInfo;
		};
		currentBest: {
			rawDiscount: number;
			discount: number;
			savings: number;
			rarity: RarityInfo;
			isEqualToSteam: boolean;
		};
		historicalBest: {
			rawDiscount: number;
			discount: number;
			savings: number;
			rarity: RarityInfo;
			isEqualToSteam: boolean;
		};
		hltb: {
			url: string;
		};
	};
}

// Composed interface for backward compatibility
export interface GameData extends GameBasicInfo, GamePricing, GameAnalytics {}

export type GameDataResponse = GameData | { success: false; data: ApiError; error?: unknown };
