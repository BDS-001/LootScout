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

// Combined interface - simpler approach
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
		release_date?: {
			coming_soon: boolean;
			date: string;
		};
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
	steamReviewData: SteamApiResponse | null;
}

export type CombinedGameDataResponse =
	| { success: true; data: CombinedGameData }
	| { success: false; data: ApiError; error?: unknown };

// Simple, consolidated GameData interface
export interface GameData {
	success: true;
	title: string;
	appId: string;
	deal?: {
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
		totalReviews?: number;
		positivePercentage?: number;
		reviewSummary?: string;
		reviewScore?: string;
		averagePlaytime?: number;
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
		currentBest?: {
			rawDiscount: number;
			discount: number;
			savings: number;
			rarity: {
				name: string;
				className: string;
			};
			isEqualToSteam: boolean;
		};
		historicalBest?: {
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
		costPerHour?: {
			steam: number;
			currentBest: number;
			historicalBest: number;
		};
		reviews?: {
			totalReviews: number;
			positivePercentage: number;
			reviewSummary: string;
			reviewScore: string;
		};
	};
}

export type GameDataResponse = GameData | { success: false; data: ApiError; error?: unknown };

// Steam Review Types
export interface SteamReviewAuthor {
	steamid: string;
	num_games_owned: number;
	num_reviews: number;
	playtime_forever: number;
	playtime_last_two_weeks: number;
	playtime_at_review: number;
	last_played: number;
}

export interface SteamReview {
	recommendationid: string;
	author: SteamReviewAuthor;
	language: string;
	review: string;
	timestamp_created: number;
	timestamp_updated: number;
	voted_up: boolean;
	votes_up: number;
	votes_funny: number;
	weighted_vote_score: string;
	comment_count: number;
	steam_purchase: boolean;
	received_for_free: boolean;
	written_during_early_access: boolean;
	primarily_steam_deck: boolean;
}

export interface SteamReviewQuerySummary {
	num_reviews: number;
	review_score: number;
	review_score_desc: string;
	total_positive: number;
	total_negative: number;
	total_reviews: number;
}

export interface SteamReviewsResponse {
	success: number;
	query_summary: SteamReviewQuerySummary;
	reviews: SteamReview[];
	cursor?: string;
}

export interface ProcessedSteamReviews {
	totalReviews: number;
	positivePercentage: number;
	reviewSummary: string;
	reviewScore: string;
	averagePlaytime: number;
}
