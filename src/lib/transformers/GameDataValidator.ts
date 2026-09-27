import { ApiError } from '../shared/types';
import { CombinedGameDataResponse } from '../api/CombinedGameData';
import { SteamAppData } from '../api/SteamStoreApi';
import { SteamReviewApiResponse } from '../api/SteamReviewsApi';
import { GgDealsGameData } from '../api/GgDealsApi';
import { debug } from '../utils/debug';

function validateSteamReviewData(steamReviewData: SteamReviewApiResponse | null): boolean {
	return steamReviewData?.success === true;
}

interface ValidationResult {
	isValid: boolean;
	appId?: string;
	steamAppData?: SteamAppData;
	ggDealsData?: GgDealsGameData;
	error?: ApiError;
	isFree?: boolean;
	isComingSoon?: boolean;
	hasValidReviews?: boolean;
}

export function validateGameData(res: CombinedGameDataResponse): ValidationResult {
	if (!res.success) {
		debug.error('CombinedGameDataResponse not successful:', res);
		return {
			isValid: false,
			error: {
				name: 'API Error',
				message: 'Combined API request failed',
				code: 0,
				status: 0,
			},
		};
	}

	if (!res.data.steamStoreData.success) {
		debug.error('Steam API failed:', res.data.steamStoreData);
		return {
			isValid: false,
			error: {
				name: 'Steam API Error',
				message: res.data.steamStoreData.data?.message || 'Steam API request failed',
				code: res.data.steamStoreData.data?.code || 0,
				status: res.data.steamStoreData.data?.status || 0,
			},
		};
	}

	const { appId } = res.data;
	const steamStoreResponse = res.data.steamStoreData.data;
	const steamAppData = Object.values(steamStoreResponse)[0];
	const isFree = steamAppData?.data?.is_free || false;
	const isComingSoon = steamAppData?.data?.release_date?.coming_soon || false;
	const hasValidReviews = validateSteamReviewData(res.data.steamReviewData);

	if (isFree || isComingSoon) {
		return { isValid: true, appId, steamAppData, isFree, isComingSoon, hasValidReviews };
	}

	if (!res.data.dealData.success) {
		debug.error('GG.deals API failed:', res.data.dealData);
		return {
			isValid: false,
			error: {
				name: 'GG.deals API Error',
				message: res.data.dealData.data?.message || 'GG.deals API request failed',
				code: res.data.dealData.data?.code || 0,
				status: res.data.dealData.data?.status || 0,
			},
		};
	}

	const ggDealsResponse = res.data.dealData.data;
	const ggDealsData = ggDealsResponse[appId];

	if (!steamAppData?.data?.price_overview || !ggDealsData) {
		return {
			isValid: false,
			error: {
				name: 'Data Error',
				message: 'Required data not found in API responses',
				code: 0,
				status: 0,
			},
		};
	}

	return { isValid: true, appId, steamAppData, ggDealsData, hasValidReviews };
}
