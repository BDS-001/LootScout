// API Error Structure
export interface ApiError {
	name: string;
	message: string;
	code: number;
	status: number;
}

// Generic API Response Type
export type ApiResponse<T> = { success: true; data: T } | { success: false; data: ApiError };

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

// Processed GameData interface for UI consumption
export interface ProcessedGameData {
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
		reviewScore?: number;
		averagePlaytime?: number;
	};
	lootScout: {
		steam: {
			status: {
				text: string;
				className: string;
			};
		};
		currentBest?: {
			rawDiscount: number;
			discount: number;
			savings: number;
			isEqualToSteam: boolean;
		};
		historicalBest?: {
			rawDiscount: number;
			discount: number;
			savings: number;
			isEqualToSteam: boolean;
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
			reviewScore: number;
		};
	};
}

export type GameDataResponse = ApiResponse<ProcessedGameData>;

// Settings Types
export interface RaritySettings {
	includePlaytime: boolean;
	includeReviewScore: boolean;
}

export interface AppSettings {
	region: RegionCode;
	rarity: RaritySettings;
}
