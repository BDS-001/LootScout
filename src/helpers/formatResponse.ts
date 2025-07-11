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

function validateGameData(res: CombinedGameDataResponse): {
	isValid: boolean;
	steamAppData?: any;
	ggDealsData?: any;
	error?: ApiError;
} {
	if (!res.success || !res.data.dealData.success || !res.data.steamStoreData.success) {
		return {
			isValid: false,
			error: {
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
			isValid: false,
			error: {
				name: 'Data Error',
				message: 'Required data not found in API responses',
				code: 0,
				status: 0,
			} as ApiError,
		};
	}

	return { isValid: true, steamAppData, ggDealsData };
}

function calculatePriceMetrics(steamPriceOverview: any, ggDealsData: any) {
	const steamPrice = steamPriceOverview.final || 0;
	const steamOriginalPrice = steamPriceOverview.initial || steamPriceOverview.final || 0;
	const currentRetail = ggDealsData.prices.currentRetail;
	const historicalRetail = ggDealsData.prices.historicalRetail;

	const currentRawDiscount = calculateDiscount(steamOriginalPrice, currentRetail);
	const historicalRawDiscount = calculateDiscount(steamOriginalPrice, historicalRetail);
	const currentDiscount = calculateDiscount(steamPrice, currentRetail);
	const historicalDiscount = calculateDiscount(steamPrice, historicalRetail);
	const currentSavings = calculateSavings(steamPrice, currentRetail);
	const historicalSavings = calculateSavings(steamPrice, historicalRetail);
	const steamEqualsCurrent = steamPrice === currentRetail;
	const steamEqualsHistorical = steamPrice === historicalRetail;

	return {
		steamPrice,
		steamOriginalPrice,
		currentRetail,
		historicalRetail,
		currentRawDiscount,
		historicalRawDiscount,
		currentDiscount,
		historicalDiscount,
		currentSavings,
		historicalSavings,
		steamEqualsCurrent,
		steamEqualsHistorical,
	};
}

function calculateRarityMetrics(steamPriceOverview: any, priceMetrics: any) {
	const steamRarity = getRarity(steamPriceOverview.discount_percent);
	const currentRarity = getRarity(priceMetrics.currentRawDiscount);
	const historicalRarity = getRarity(priceMetrics.historicalRawDiscount);

	return { steamRarity, currentRarity, historicalRarity };
}

function buildGameDataResponse(
	appId: string,
	steamAppData: any,
	ggDealsData: any,
	priceMetrics: any,
	rarityMetrics: any
): GameDataResponse {
	const steamPriceOverview = steamAppData.data.price_overview;
	const steamStatus = getSteamDealStatus(
		priceMetrics.steamEqualsCurrent,
		priceMetrics.steamEqualsHistorical
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
				isEqualToSteam: priceMetrics.steamEqualsCurrent,
			},
			historicalBest: {
				rawDiscount: priceMetrics.historicalRawDiscount,
				discount: priceMetrics.historicalDiscount,
				savings: priceMetrics.historicalSavings,
				rarity: {
					name: rarityMetrics.historicalRarity,
					className: rarityMetrics.historicalRarity.toLowerCase(),
				},
				isEqualToSteam: priceMetrics.steamEqualsHistorical,
			},
			hltb: {
				url: getHltbUrl(ggDealsData.title),
			},
		},
	};
}

export function normalizeResponse(res: CombinedGameDataResponse): GameDataResponse {
	const validation = validateGameData(res);
	if (!validation.isValid) {
		return {
			success: false,
			data: validation.error!,
		};
	}

	const { steamAppData, ggDealsData } = validation;
	const priceMetrics = calculatePriceMetrics(steamAppData.data.price_overview, ggDealsData);
	const rarityMetrics = calculateRarityMetrics(steamAppData.data.price_overview, priceMetrics);

	return buildGameDataResponse(
		(res.data as any).appId,
		steamAppData,
		ggDealsData,
		priceMetrics,
		rarityMetrics
	);
}
