import fetchGgDealsData from './ggDealsApi';
import fetchSteamStoreData from './steamStoreApi';
import { CombinedGameDataParams, CombinedGameDataResponse } from '../shared/types';
import { handleApiError } from '../utils/apiErrorHandler';

export default async function fetchCombinedGameData(
	params: CombinedGameDataParams
): Promise<CombinedGameDataResponse> {
	const { appId, apiKey, region } = params;

	try {
		// Fetch both APIs concurrently for better performance
		const [ggDealsData, steamStoreData] = await Promise.all([
			fetchGgDealsData({ appId, apiKey, region }),
			fetchSteamStoreData({ appId, region }),
		]);

		return {
			success: true,
			data: {
				appId,
				dealData: ggDealsData,
				steamStoreData,
			},
		};
	} catch (error) {
		return handleApiError(error, 'Combined Game Data');
	}
}
