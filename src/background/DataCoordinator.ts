import fetchSteamStoreData from '../lib/api/SteamStoreApi';
import fetchSteamReviewData from '../lib/api/SteamReviewsApi';
import fetchGgDealsData from '../lib/api/GgDealsApi';
import { normalizeResponse } from '../lib/transformers/ResponseFormatter';
import { ProcessedSteamReviews } from '../lib/transformers/SteamReviewProcessor';
import { CombinedGameDataResponse } from '../lib/api/CombinedGameData';
import { getRegion } from '../lib/services/SettingsService';
import { getApiKeyWithFallback } from '../lib/api/ApiKeyService';
import { getCacheItemWithExpiry, setCacheItem } from '../lib/services/CacheService';
import { processSteamReviews } from '../lib/transformers/SteamReviewProcessor';
import { debug } from '../lib/utils/debug';
import {
	getGameStatus,
	shouldFetchReviews,
	shouldFetchDeals,
} from '../lib/services/GameStatusService';

export class DataCoordinator {
	private static readonly CACHE_DURATION = 30 * 60 * 1000;

	private getReviewCacheKey(appId: string): string {
		return `processed_reviews_${appId}`;
	}

	private async getCachedProcessedReviews(appId: string): Promise<ProcessedSteamReviews | null> {
		const cached = await getCacheItemWithExpiry(
			this.getReviewCacheKey(appId),
			DataCoordinator.CACHE_DURATION
		);

		if (cached) {
			debug.log('Using cached processed reviews');
		}

		return cached as ProcessedSteamReviews | null;
	}

	private async setCachedProcessedReviews(
		appId: string,
		processedReviews: ProcessedSteamReviews
	): Promise<void> {
		await setCacheItem(this.getReviewCacheKey(appId), processedReviews);
	}

	public async fetchGameData(appId: string): Promise<any> {
		const region = await getRegion();
		const cacheKey = `game_data_${appId}_${region}`;
		const cachedData = await getCacheItemWithExpiry(cacheKey, DataCoordinator.CACHE_DURATION);

		if (cachedData) {
			debug.log('Using cached data');
			return cachedData;
		}

		const apiKey = await getApiKeyWithFallback();
		const steamParams = { appId, region };

		try {
			const steamStoreData = await fetchSteamStoreData(steamParams);

			if (!steamStoreData.success) {
				return { success: false, data: steamStoreData.data };
			}

			const steamAppData = steamStoreData.data[appId];
			const gameStatus = getGameStatus(steamAppData);
			const cachedProcessedReviews = await this.getCachedProcessedReviews(appId);

			const needReviews = shouldFetchReviews(gameStatus, !!cachedProcessedReviews);
			const needDeals = shouldFetchDeals(gameStatus);

			const [steamReviewData, ggDealsData] = await Promise.all([
				needReviews ? fetchSteamReviewData(steamParams) : Promise.resolve(null),
				needDeals
					? fetchGgDealsData({ appId, apiKey: apiKey || '', region })
					: Promise.resolve(null),
			]);

			const combinedData: CombinedGameDataResponse = {
				success: true,
				data: {
					appId,
					dealData: ggDealsData || { success: true, data: {} },
					steamStoreData,
					steamReviewData,
				},
			};

			let processedReviews = cachedProcessedReviews;
			if (!processedReviews && steamReviewData?.success) {
				try {
					processedReviews = processSteamReviews(steamReviewData.data);
					await this.setCachedProcessedReviews(appId, processedReviews);
				} catch (error) {
					debug.warn('Failed to process reviews:', error);
					processedReviews = null;
				}
			}

			const normalizedRes = normalizeResponse(combinedData, processedReviews);

			if (normalizedRes.success) {
				await setCacheItem(cacheKey, normalizedRes);
			}

			return normalizedRes;
		} catch (error) {
			return { success: false, data: error };
		}
	}
}
