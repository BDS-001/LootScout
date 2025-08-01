import { ProcessedGameData } from '../shared/types';
import { ProcessedSteamReviews } from './SteamReviewProcessor';
import { getSteamDealStatus } from './PriceCalculator';

// Local interfaces for response building
interface SteamAppData {
	data: {
		name: string;
		is_free?: boolean;
		release_date?: {
			coming_soon: boolean;
			date?: string;
		};
		price_overview?: {
			currency: string;
			initial?: number;
			final: number;
			discount_percent: number;
		};
	};
}

interface GgDealsGameData {
	title: string;
	url: string;
	prices: {
		currentRetail: number;
		historicalRetail: number;
		currency: string;
	};
}

interface PriceMetrics {
	steamPrice: number;
	steamOriginalPrice: number;
	currentRetail: number;
	historicalRetail: number;
	currentRawDiscount: number;
	historicalRawDiscount: number;
	currentDiscount: number;
	historicalDiscount: number;
	currentSavings: number;
	historicalSavings: number;
	steamIsBestCurrent: boolean;
	steamIsBestHistorical: boolean;
}

export function buildFreeGameResponse(
	appId: string,
	steamAppData: SteamAppData,
	processedReviews?: ProcessedSteamReviews | null
): ProcessedGameData {
	return {
		success: true,
		title: steamAppData.data.name,
		appId,
		steam: {
			currency: 'USD',
			initial: 0,
			final: 0,
			discount_percent: 0,
			...(processedReviews && {
				totalReviews: processedReviews.totalReviews,
				positivePercentage: processedReviews.positivePercentage,
				reviewSummary: processedReviews.reviewSummary,
				reviewScore: processedReviews.reviewScore,
				averagePlaytime: processedReviews.averagePlaytime,
			}),
		},
		lootScout: {
			steam: {
				status: {
					text: 'This game is free to play',
					className: 'steam_free_game',
				},
			},
		},
	};
}

export function buildComingSoonResponse(
	appId: string,
	steamAppData: SteamAppData,
	processedReviews?: ProcessedSteamReviews | null
): ProcessedGameData {
	const releaseDate = steamAppData.data.release_date?.date || 'TBA';
	return {
		success: true,
		title: steamAppData.data.name,
		appId,
		steam: {
			currency: 'USD',
			initial: 0,
			final: 0,
			discount_percent: 0,
		},
		lootScout: {
			steam: {
				status: {
					text: `Coming soon: ${releaseDate}`,
					className: 'steam_coming_soon',
				},
			},
			...(processedReviews && {
				reviews: {
					totalReviews: processedReviews.totalReviews,
					positivePercentage: processedReviews.positivePercentage,
					reviewSummary: processedReviews.reviewSummary,
					reviewScore: processedReviews.reviewScore,
				},
			}),
		},
	};
}

export function buildGameDataResponse(
	appId: string,
	steamAppData: SteamAppData,
	ggDealsData: GgDealsGameData,
	priceMetrics: PriceMetrics,
	processedReviews?: ProcessedSteamReviews | null,
	costPerHour?: { steam: number; currentBest: number; historicalBest: number } | null
): ProcessedGameData {
	const steamPriceOverview = steamAppData.data.price_overview!;
	const steamStatus = getSteamDealStatus(
		priceMetrics.steamIsBestCurrent,
		priceMetrics.steamIsBestHistorical
	);

	return {
		success: true,
		title: ggDealsData.title,
		appId: appId,
		releaseDate: steamAppData.data.release_date?.date,
		deal: {
			currentBest: priceMetrics.currentRetail,
			historicalBest: priceMetrics.historicalRetail,
			currency: ggDealsData.prices.currency,
			url: ggDealsData.url,
		},
		steam: {
			currency: steamPriceOverview.currency,
			initial: steamPriceOverview.initial ?? steamPriceOverview.final,
			final: steamPriceOverview.final,
			discount_percent: steamPriceOverview.discount_percent,
			...(processedReviews && {
				totalReviews: processedReviews.totalReviews,
				positivePercentage: processedReviews.positivePercentage,
				reviewSummary: processedReviews.reviewSummary,
				reviewScore: processedReviews.reviewScore,
				averagePlaytime: processedReviews.averagePlaytime,
			}),
		},
		lootScout: {
			steam: {
				status: steamStatus,
			},
			currentBest: {
				rawDiscount: priceMetrics.currentRawDiscount,
				discount: priceMetrics.currentDiscount,
				savings: priceMetrics.currentSavings,
				isEqualToSteam: priceMetrics.steamIsBestCurrent,
			},
			historicalBest: {
				rawDiscount: priceMetrics.historicalRawDiscount,
				discount: priceMetrics.historicalDiscount,
				savings: priceMetrics.historicalSavings,
				isEqualToSteam: priceMetrics.steamIsBestHistorical,
			},
			...(costPerHour && {
				costPerHour: {
					steam: costPerHour.steam,
					currentBest: costPerHour.currentBest,
					historicalBest: costPerHour.historicalBest,
				},
			}),
		},
	};
}
