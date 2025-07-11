import fetchCombinedGameData from '../api/combinedGameData';
import { normalizeResponse } from '../transformers/formatResponse';
import { CombinedGameDataParams } from '../shared/types';
import { loadCountryCode } from '../services/countryService';
import { getApiKeyWithFallback } from '../api/apiKeyService';

export class DataCoordinator {
	public async fetchGameData(appId: string): Promise<any> {
		const region = await loadCountryCode();
		console.log('Using region:', region);

		const apiKey = await getApiKeyWithFallback();

		if (!apiKey) {
			console.error(
				'LootScout: API key not found. Please check environment configuration or configure your API key in the extension popup.'
			);
			return { success: false, data: 'API key not found' };
		}

		const params: CombinedGameDataParams = {
			appId,
			apiKey,
			region,
		};

		try {
			const res = await fetchCombinedGameData(params);
			console.log('Raw combined data response:', res);
			const normalizedRes = normalizeResponse(res);
			console.log('Normalized response:', normalizedRes);
			return normalizedRes;
		} catch (error) {
			console.error('Error fetching combined game data:', error);
			return { success: false, data: error };
		}
	}
}
