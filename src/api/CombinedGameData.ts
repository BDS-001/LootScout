import fetchGgDealsData from './GgDealsApi';
import fetchSteamStoreData from './SteamStoreApi';
import {
	CombinedGameDataParams,
	CombinedGameDataResponse,
	GgDealsApiResponse,
} from '../shared/types';
import { handleApiError } from '../utils/ErrorHandler';

function shouldSkipGgDeals(steamAppData: any): boolean {
	return steamAppData?.data?.is_free || steamAppData?.data?.release_date?.coming_soon;
}

function createEmptyGgDealsResponse(): GgDealsApiResponse {
	return { success: true as const, data: {} as Record<string, null> };
}

export default async function fetchCombinedGameData(
	params: CombinedGameDataParams
): Promise<CombinedGameDataResponse> {
	const { appId, apiKey, region } = params;

	try {
		const steamStoreData = await fetchSteamStoreData({ appId, region });

		const steamAppData = steamStoreData.success ? steamStoreData.data[appId] : null;
		const ggDealsData = shouldSkipGgDeals(steamAppData)
			? createEmptyGgDealsResponse()
			: await fetchGgDealsData({ appId, apiKey, region });

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
