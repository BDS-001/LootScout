import { ApiError } from '../shared/types';
import { CombinedGameDataResponse } from '../api/CombinedGameData';
import { SteamAppDetails, SteamPriceOverview } from '../api/SteamStoreApi';
import { GgDealsGameData } from '../api/GgDealsApi';
import { debug } from '../utils/debug';

interface InvalidResult {
	isValid: false;
	error: ApiError;
}

interface FreeOrUpcomingResult {
	isValid: true;
	kind: 'free' | 'comingSoon';
	appId: string;
	steamDetails: SteamAppDetails;
}

interface PricedResult {
	isValid: true;
	kind: 'priced';
	appId: string;
	steamDetails: SteamAppDetails;
	steamPriceOverview: SteamPriceOverview;
	ggDealsData: GgDealsGameData;
}

export type ValidationResult = InvalidResult | FreeOrUpcomingResult | PricedResult;

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
	const steamDetails = steamAppData?.data;

	if (steamDetails?.release_date?.coming_soon) {
		return { isValid: true, kind: 'comingSoon', appId, steamDetails };
	}

	if (steamDetails?.is_free) {
		return { isValid: true, kind: 'free', appId, steamDetails };
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

	const steamPriceOverview = steamDetails?.price_overview;

	if (!steamDetails || !steamPriceOverview || !ggDealsData) {
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

	return { isValid: true, kind: 'priced', appId, steamDetails, steamPriceOverview, ggDealsData };
}
