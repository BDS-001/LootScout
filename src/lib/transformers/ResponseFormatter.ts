import { GameDataResponse } from '../shared/types';
import { ProcessedSteamReviews } from './SteamReviewProcessor';
import { CombinedGameDataResponse, RawCombinedGameData } from '../api/CombinedGameData';
import { validateGameData } from './GameDataValidator';
import { calculatePriceMetrics, calculateCostPerHour } from './PriceCalculator';
import {
	buildFreeGameResponse,
	buildComingSoonResponse,
	buildGameDataResponse,
} from './ResponseBuilder';

export function normalizeResponse(
	res: CombinedGameDataResponse,
	processedReviews?: ProcessedSteamReviews | null
): GameDataResponse {
	const validation = validateGameData(res);
	if (!validation.isValid) {
		return {
			success: false,
			data: validation.error!,
		};
	}

	const { steamAppData, ggDealsData, isFree, isComingSoon } = validation;
	const combinedData = res.data as RawCombinedGameData;
	const appId = combinedData.appId;

	if (isComingSoon) {
		return {
			success: true,
			data: buildComingSoonResponse(appId, steamAppData as any, null),
		};
	}

	if (isFree) {
		return {
			success: true,
			data: buildFreeGameResponse(appId, steamAppData as any, processedReviews),
		};
	}

	const steamApp = steamAppData as any;
	const priceMetrics = calculatePriceMetrics(steamApp.data.price_overview, ggDealsData as any);

	const costPerHour =
		processedReviews?.averagePlaytime && processedReviews.averagePlaytime > 0
			? {
					steam: calculateCostPerHour(priceMetrics.steamPrice, processedReviews.averagePlaytime),
					currentBest: calculateCostPerHour(
						priceMetrics.currentRetail,
						processedReviews.averagePlaytime
					),
					historicalBest: calculateCostPerHour(
						priceMetrics.historicalRetail,
						processedReviews.averagePlaytime
					),
				}
			: null;

	return {
		success: true,
		data: buildGameDataResponse(
			appId,
			steamApp as any,
			ggDealsData as any,
			priceMetrics,
			processedReviews,
			costPerHour
		),
	};
}
