import { GameDataResponse, ProcessedSteamReviews } from '../shared/types';
import { getHltbUrl } from '../helpers/hltb';
import { getSteamDealStatus } from './PriceCalculator';

export function buildFreeGameResponse(
	appId: string,
	steamAppData: any,
	processedReviews?: ProcessedSteamReviews | null
): GameDataResponse {
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
				rarity: {
					name: 'Free',
					className: 'free',
				},
			},
			hltb: {
				url: getHltbUrl(steamAppData.data.name),
			},
		},
	};
}

export function buildComingSoonResponse(
	appId: string,
	steamAppData: any,
	processedReviews?: ProcessedSteamReviews | null
): GameDataResponse {
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
				rarity: {
					name: 'Coming Soon',
					className: 'coming_soon',
				},
			},
			hltb: {
				url: getHltbUrl(steamAppData.data.name),
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
	steamAppData: any,
	ggDealsData: any,
	priceMetrics: any,
	rarityMetrics: any,
	processedReviews?: ProcessedSteamReviews | null,
	costPerHour?: { steam: number; currentBest: number; historicalBest: number } | null
): GameDataResponse {
	const steamPriceOverview = steamAppData.data.price_overview;
	const steamStatus = getSteamDealStatus(
		priceMetrics.steamIsBestCurrent,
		priceMetrics.steamIsBestHistorical
	);

	return {
		success: true,
		title: ggDealsData.title,
		appId: appId,
		deal: {
			currentBest: priceMetrics.currentRetail,
			historicalBest: priceMetrics.historicalRetail,
			currency: ggDealsData.prices.currency,
			url: ggDealsData.url,
		},
		steam: {
			currency: steamPriceOverview.currency,
			initial: steamPriceOverview.initial,
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
				rarity: {
					name: rarityMetrics.steamRarity,
					className: rarityMetrics.steamRarity.toLowerCase(),
				},
			},
			currentBest: {
				rawDiscount: priceMetrics.currentRawDiscount,
				discount: priceMetrics.currentDiscount,
				savings: priceMetrics.currentSavings,
				rarity: {
					name: rarityMetrics.currentRarity,
					className: rarityMetrics.currentRarity.toLowerCase(),
				},
				isEqualToSteam: priceMetrics.steamIsBestCurrent,
			},
			historicalBest: {
				rawDiscount: priceMetrics.historicalRawDiscount,
				discount: priceMetrics.historicalDiscount,
				savings: priceMetrics.historicalSavings,
				rarity: {
					name: rarityMetrics.historicalRarity,
					className: rarityMetrics.historicalRarity.toLowerCase(),
				},
				isEqualToSteam: priceMetrics.steamIsBestHistorical,
			},
			hltb: {
				url: getHltbUrl(ggDealsData.title),
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
