import fetchSteamStoreData from '../api/SteamStoreApi';
import fetchSteamReviewData from '../api/SteamReviewsApi';
import fetchGgDealsData, { GgDealsApiResponse } from '../api/GgDealsApi';
import { normalizeResponse } from '../transformers/ResponseFormatter';
import { ProcessedSteamReviews } from '../transformers/SteamReviewProcessor';
import { CombinedGameDataResponse } from '../api/CombinedGameData';
import { getRegion } from '../services/SettingsService';
import { getApiKeyWithFallback } from '../api/ApiKeyService';
import { getCacheItemWithExpiry, setCacheItem } from '../services/CacheService';
import { processSteamReviews } from '../transformers/SteamReviewProcessor';
import { debug } from '../utils/debug';
import { getGameStatus, shouldFetchReviews, shouldFetchDeals } from '../services/GameStatusService';

export class DataCoordinator {
	private static readonly CACHE_DURATION = 30 * 60 * 1000;
	private static readonly ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

	private getReviewCacheKey(appId: string): string {
		return `processed_reviews_${appId}`;
	}

	private async getCachedProcessedReviews(appId: string): Promise<ProcessedSteamReviews | null> {
		const cached = await getCacheItemWithExpiry(
			this.getReviewCacheKey(appId),
			DataCoordinator.ONE_WEEK
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
					processedReviews = processSteamReviews(steamReviewData.data as any);
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
