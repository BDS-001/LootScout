import {
	CombinedGameDataResponse,
	GameDataResponse,
	ProcessedSteamReviews,
	CombinedGameData,
} from '../shared/types';
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
	const combinedData = res.data as CombinedGameData;
	const appId = combinedData.appId;

	if (isComingSoon) {
		return buildComingSoonResponse(appId, steamAppData, null);
	}

	if (isFree) {
		return buildFreeGameResponse(appId, steamAppData, processedReviews);
	}

	const steamApp = steamAppData as { data: { price_overview: unknown } };
	const priceMetrics = calculatePriceMetrics(steamApp.data.price_overview, ggDealsData);

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

	return buildGameDataResponse(
		appId,
		steamApp,
		ggDealsData,
		priceMetrics,
		processedReviews,
		costPerHour
	);
}
