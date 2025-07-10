import { CombinedGameDataResponse, GameDataResponse, ApiError } from '../shared/types';
import { calculateDiscount, calculateSavings } from '../utils/priceCalculations';
import { getRarity } from '../helpers/getRarity';
import { getHltbUrl } from '../helpers/hltb';

// Steam Deal Status Function
function getSteamDealStatus(
	steamEqualsCurrent: boolean,
	steamEqualsHistorical: boolean
): { text: string; className: string } {
	if (steamEqualsHistorical) {
		return {
			text: 'Steam is offering the historical low',
			className: 'steam_historical_low',
		};
	} else if (steamEqualsCurrent) {
		return {
			text: 'Steam is offering the current best deal',
			className: 'steam_current_best',
		};
	} else {
		return {
			text: 'Better deal available',
			className: 'steam_better_elsewhere',
		};
	}
}

export function normalizeResponse(res: CombinedGameDataResponse): GameDataResponse {
	if (!res.success || !res.data.dealData.success || !res.data.steamStoreData.success) {
		return {
			success: false,
			data: {
				name: 'Normalization Error',
				message: 'Failed to normalize response data',
				code: 0,
				status: 0,
			} as ApiError,
		};
	}

	const steamAppData = res.data.steamStoreData.data[res.data.appId];
	const ggDealsData = res.data.dealData.data[res.data.appId];

	if (!steamAppData?.data?.price_overview || !ggDealsData) {
		return {
			success: false,
			data: {
				name: 'Data Error',
				message: 'Required data not found in API responses',
				code: 0,
				status: 0,
			} as ApiError,
		};
	}

	const steamPriceOverview = steamAppData.data.price_overview;

	// Calculate all business logic
	const steamPrice = steamPriceOverview.final || 0;
	const steamOriginalPrice = steamPriceOverview.initial || steamPriceOverview.final || 0;
	const currentRetail = ggDealsData.prices.currentRetail;
	const historicalRetail = ggDealsData.prices.historicalRetail;

	// Price comparisons
	const currentRawDiscount = calculateDiscount(steamOriginalPrice, currentRetail);
	const historicalRawDiscount = calculateDiscount(steamOriginalPrice, historicalRetail);
	const currentDiscount = calculateDiscount(steamPrice, currentRetail);
	const historicalDiscount = calculateDiscount(steamPrice, historicalRetail);
	const currentSavings = calculateSavings(steamPrice, currentRetail);
	const historicalSavings = calculateSavings(steamPrice, historicalRetail);
	const steamEqualsCurrent = steamPrice === currentRetail;
	const steamEqualsHistorical = steamPrice === historicalRetail;

	// Rarity calculations
	const steamRarity = getRarity(steamPriceOverview.discount_percent);
	const currentRarity = getRarity(currentRawDiscount);
	const historicalRarity = getRarity(historicalRawDiscount);

	// Steam deal status
	const steamStatus = getSteamDealStatus(steamEqualsCurrent, steamEqualsHistorical);

	return {
		success: true,
		title: ggDealsData.title,
		appId: res.data.appId,
		deal: {
			currentBest: currentRetail,
			historicalBest: historicalRetail,
			currency: ggDealsData.prices.currency,
			url: ggDealsData.url,
		},
		steam: {
			currency: steamPriceOverview.currency,
			initial: steamPriceOverview.initial,
			final: steamPriceOverview.final,
			discount_percent: steamPriceOverview.discount_percent,
		},
		lootScout: {
			steam: {
				status: steamStatus,
				rarity: {
					name: steamRarity,
					className: steamRarity.toLowerCase(),
				},
			},
			currentBest: {
				rawDiscount: currentRawDiscount,
				discount: currentDiscount,
				savings: currentSavings,
				rarity: {
					name: currentRarity,
					className: currentRarity.toLowerCase(),
				},
				isEqualToSteam: steamEqualsCurrent,
			},
			historicalBest: {
				rawDiscount: historicalRawDiscount,
				discount: historicalDiscount,
				savings: historicalSavings,
				rarity: {
					name: historicalRarity,
					className: historicalRarity.toLowerCase(),
				},
				isEqualToSteam: steamEqualsHistorical,
			},
			hltb: {
				url: getHltbUrl(ggDealsData.title),
			},
		},
	};
}
