import { GgDealsApiResponse } from './GgDealsApi';
import { SteamApiResponse } from './SteamStoreApi';
import { SteamReviewApiResponse } from './SteamReviewsApi';
import { RegionCode, ApiResponse } from '../shared/types';

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
	steamReviewData: SteamReviewApiResponse | null;
}

export type CombinedGameDataResponse = ApiResponse<RawCombinedGameData>;
