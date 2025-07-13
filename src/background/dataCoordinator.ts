import fetchCombinedGameData from '../api/combinedGameData';
import { normalizeResponse } from '../transformers/formatResponse';
import { CombinedGameDataParams } from '../shared/types';
import { loadCountryCode } from '../services/countryService';
import { getApiKeyWithFallback } from '../api/apiKeyService';
import { getCacheItemWithExpiry, setCacheItem } from '../services/cacheService';

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
