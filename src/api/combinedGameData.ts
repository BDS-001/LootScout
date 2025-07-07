import fetchGgDealsData from './ggDealsApi';
import fetchSteamStoreData from './steamStoreApi';
import { CombinedGameDataParams, CombinedGameDataResponse } from '../shared/types';

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
				ggDealsData,
				steamStoreData,
			},
		};
	} catch (error) {
		console.error('Combined game data fetch error:', error);
		return {
			success: false,
			data: {
				name: 'Network Error',
				message: 'Error fetching combined game data',
				code: 0,
				status: 0,
			},
			error,
		};
	}
}
