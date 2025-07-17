import { CombinedGameDataResponse, GameDataResponse, SteamReviewsResponse } from '../shared/types';
import { validateGameData } from './GameDataValidator';
import { calculatePriceMetrics, calculateRarityMetrics } from './PriceCalculator';
import { buildFreeGameResponse, buildComingSoonResponse, buildGameDataResponse } from './ResponseBuilder';
import { processSteamReviews } from './SteamReviewProcessor';

export function normalizeResponse(res: CombinedGameDataResponse): GameDataResponse {
	const validation = validateGameData(res);
	if (!validation.isValid) {
		return {
			success: false,
			data: validation.error!,
		};
	}

	const { steamAppData, ggDealsData, isFree, isComingSoon, hasValidReviews } = validation;
	const { appId, steamReviewData } = res.data as { appId: string; steamReviewData: { success: boolean; data: SteamReviewsResponse } | null };

	if (isComingSoon) {
		return buildComingSoonResponse(appId, steamAppData, null);
	}

	let processedReviews = null;
	if (hasValidReviews && steamReviewData?.success) {
		try {
			processedReviews = processSteamReviews(steamReviewData.data);
			console.log('Processed Steam Reviews:', processedReviews);
		} catch (error) {
			console.warn('Failed to process Steam reviews:', error);
			processedReviews = null;
		}
	}

	if (isFree) {
		return buildFreeGameResponse(appId, steamAppData, processedReviews);
	}

	const steamApp = steamAppData as { data: { price_overview: unknown } };
	const priceMetrics = calculatePriceMetrics(steamApp.data.price_overview, ggDealsData);
	const rarityMetrics = calculateRarityMetrics(steamApp.data.price_overview, priceMetrics);

	return buildGameDataResponse(appId, steamApp, ggDealsData, priceMetrics, rarityMetrics, processedReviews);
}