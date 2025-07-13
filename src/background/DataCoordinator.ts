import fetchCombinedGameData from '../api/CombinedGameData';
import { normalizeResponse } from '../transformers/ResponseFormatter';
import { CombinedGameDataParams } from '../shared/types';
import { loadCountryCode } from '../services/CountryService';
import { getApiKeyWithFallback } from '../api/ApiKeyService';
import { getCacheItemWithExpiry, setCacheItem } from '../services/CacheService';

export class DataCoordinator {
	private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

	public async fetchGameData(appId: string): Promise<any> {
		const region = await loadCountryCode();
		const cacheKey = `game_data_${appId}_${region}`;
		const cachedData = await getCacheItemWithExpiry(cacheKey, DataCoordinator.CACHE_DURATION);

		if (cachedData) {
			console.log('LootScout: Using cached data');
			return cachedData;
		}

		const apiKey = await getApiKeyWithFallback();

		const params: CombinedGameDataParams = {
			appId,
			apiKey: apiKey || '',
			region,
		};

		try {
			const res = await fetchCombinedGameData(params);
			const normalizedRes = normalizeResponse(res);
			await setCacheItem(cacheKey, normalizedRes);
			return normalizedRes;
		} catch (error) {
			return { success: false, data: error };
		}
	}
}
