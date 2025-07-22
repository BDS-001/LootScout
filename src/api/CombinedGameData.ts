import fetchGgDealsData, { GgDealsApiResponse } from './GgDealsApi';
import fetchSteamStoreData, { SteamApiResponse } from './SteamStoreApi';
import fetchSteamReviewData from './SteamReviewsApi';
import { RegionCode, ApiResponse } from '../shared/types';
import { handleApiError } from '../utils/ErrorHandler';

// Combined API types
export interface CombinedGameDataParams {
	appId: string;
	apiKey: string;
	region: RegionCode;
}

export interface RawCombinedGameData {
	appId: string;
	dealData: GgDealsApiResponse;
	steamStoreData: SteamApiResponse;
	steamReviewData: SteamApiResponse | null;
}

export type CombinedGameDataResponse = ApiResponse<RawCombinedGameData>;

function getGameStatus(
	steamAppData: { data?: { release_date?: { coming_soon: boolean }; is_free?: boolean } } | null
): 'not_released' | 'free' | 'paid' {
	if (steamAppData?.data?.release_date?.coming_soon) {
		return 'not_released';
	}
	if (steamAppData?.data?.is_free) {
		return 'free';
	}
	return 'paid';
}

function createEmptyGgDealsResponse(): GgDealsApiResponse {
	return { success: true as const, data: {} as Record<string, null> };
}

export default async function fetchCombinedGameData(
	params: CombinedGameDataParams,
	skipSteamReviews = false
): Promise<CombinedGameDataResponse> {
	const { appId, apiKey, region } = params;

	try {
		const steamParams = { appId, region };
		const steamStoreData = await fetchSteamStoreData(steamParams);

		const steamAppData = steamStoreData.success ? steamStoreData.data[appId] : null;
		const gameStatus = getGameStatus(steamAppData);

		let steamReviewData = null;
		let ggDealsData = createEmptyGgDealsResponse();

		switch (gameStatus) {
			case 'not_released':
				break;

			case 'free':
				if (!skipSteamReviews) {
					steamReviewData = await fetchSteamReviewData(steamParams);
				}
				break;

			case 'paid':
				if (!skipSteamReviews) {
					[steamReviewData, ggDealsData] = await Promise.all([
						fetchSteamReviewData(steamParams),
						fetchGgDealsData({ appId, apiKey, region }),
					]);
				} else {
					ggDealsData = await fetchGgDealsData({ appId, apiKey, region });
				}
				break;
		}

		return {
			success: true,
			data: {
				appId,
				dealData: ggDealsData,
				steamStoreData,
				steamReviewData,
			},
		};
	} catch (error) {
		return handleApiError(error, 'Combined Game Data');
	}
}
