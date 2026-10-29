import { GameDataResponse } from '../shared/types';
import { ProcessedSteamReviews } from './SteamReviewProcessor';
import { CombinedGameDataResponse } from '../api/CombinedGameData';
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
			data: validation.error,
		};
	}

	if (validation.kind !== 'priced') {
		return {
			success: true,
			data:
				validation.kind === 'comingSoon'
					? buildComingSoonResponse(validation.appId, validation.steamDetails, null)
					: buildFreeGameResponse(validation.appId, validation.steamDetails, processedReviews),
		};
	}

	const { appId, steamDetails, steamPriceOverview, ggDealsData } = validation;
	const priceMetrics = calculatePriceMetrics(steamPriceOverview, ggDealsData);

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
			steamDetails,
			steamPriceOverview,
			ggDealsData,
			priceMetrics,
			processedReviews,
			costPerHour
		),
	};
}
