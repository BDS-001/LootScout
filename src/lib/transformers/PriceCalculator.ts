import { calculateDiscount, calculateSavings } from '../utils/PriceUtils';

// Local interfaces for price calculation
interface SteamPriceOverview {
	initial?: number;
	final: number;
	currency: string;
	discount_percent: number;
}

interface GgDealsGamePrices {
	currentRetail: number;
	historicalRetail: number;
	currency: string;
}

interface GgDealsGameData {
	prices: GgDealsGamePrices;
}

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

export function calculatePriceMetrics(
	steamPriceOverview: SteamPriceOverview,
	ggDealsData: GgDealsGameData
) {
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

export function calculateCostPerHour(price: number, averagePlaytime: number): number {
	if (!averagePlaytime || averagePlaytime <= 0) return 0;
	return price / averagePlaytime;
}
