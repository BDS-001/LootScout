import { calculateDiscount, calculateSavings } from '../utils/PriceUtils';
import { getRarity } from '../helpers/getRarity';

export function getSteamDealStatus(
	steamIsBestCurrent: boolean,
	steamIsBestHistorical: boolean
): { text: string; className: string } {
	if (steamIsBestHistorical) {
		return {
			text: 'Steam is offering the historical low',
			className: 'steam_historical_low',
		};
	} else if (steamIsBestCurrent) {
		return {
			text: 'Steam has the best current deal',
			className: 'steam_current_best',
		};
	} else {
		return {
			text: 'Better deal available',
			className: 'steam_better_elsewhere',
		};
	}
}

export function calculatePriceMetrics(steamPriceOverview: any, ggDealsData: any) {
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
	const steamIsBestCurrent = steamPrice <= currentRetail;
	const steamIsBestHistorical = steamPrice <= historicalRetail;

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
		steamIsBestCurrent,
		steamIsBestHistorical,
	};
}

export function calculateRarityMetrics(steamPriceOverview: any, priceMetrics: any) {
	const steamRarity = getRarity(steamPriceOverview.discount_percent);
	const currentRarity = getRarity(priceMetrics.currentRawDiscount);
	const historicalRarity = getRarity(priceMetrics.historicalRawDiscount);

	return { steamRarity, currentRarity, historicalRarity };
}

export function calculateCostPerHour(price: number, averagePlaytime: number): number {
	if (!averagePlaytime || averagePlaytime <= 0) return 0;
	return price / averagePlaytime;
}
