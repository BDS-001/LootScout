import { CombinedGameDataResponse, ApiError, SteamReviewsResponse } from '../shared/types';

function validateSteamReviewData(steamReviewData: unknown): boolean {
	if (!steamReviewData || typeof steamReviewData !== 'object') {
		return false;
	}

	const apiResponse = steamReviewData as { success: boolean; data: unknown };
	if (!apiResponse.success || !apiResponse.data) {
		return false;
	}

	const reviewData = apiResponse.data as SteamReviewsResponse;
	if (!reviewData) {
		return false;
	}

	if (!reviewData.query_summary || !Array.isArray(reviewData.reviews)) {
		return false;
	}

	const { query_summary } = reviewData;
	const requiredFields = ['num_reviews', 'review_score', 'review_score_desc', 'total_positive', 'total_negative', 'total_reviews'] as const;
	for (const field of requiredFields) {
		if (!(field in query_summary)) {
			return false;
		}
	}

	return true;
}

interface ValidationResult {
	isValid: boolean;
	steamAppData?: unknown;
	ggDealsData?: unknown;
	error?: ApiError;
	isFree?: boolean;
	isComingSoon?: boolean;
	hasValidReviews?: boolean;
}

export function validateGameData(res: CombinedGameDataResponse): ValidationResult {
	if (!res.success) {
		console.error('LootScout: CombinedGameDataResponse not successful:', res);
		return {
			isValid: false,
			error: {
				name: 'API Error',
				message: 'Combined API request failed',
				code: 0,
				status: 0,
			} as ApiError,
		};
	}

	if (!res.data.steamStoreData.success) {
		console.error('LootScout: Steam API failed:', res.data.steamStoreData);
		return {
			isValid: false,
			error: {
				name: 'Steam API Error',
				message: res.data.steamStoreData.data?.message || 'Steam API request failed',
				code: res.data.steamStoreData.data?.code || 0,
				status: res.data.steamStoreData.data?.status || 0,
			} as ApiError,
		};
	}

	const steamStoreResponse = res.data.steamStoreData.data as Record<string, unknown>;
	const steamAppData = steamStoreResponse[res.data.appId] as { 
		data?: { 
			is_free?: boolean; 
			release_date?: { coming_soon?: boolean }; 
			price_overview?: unknown;
		} 
	};
	const isFree = steamAppData?.data?.is_free || false;
	const isComingSoon = steamAppData?.data?.release_date?.coming_soon || false;
	const hasValidReviews = validateSteamReviewData(res.data.steamReviewData);

	if (isFree || isComingSoon) {
		return { isValid: true, steamAppData, isFree, isComingSoon, hasValidReviews };
	}

	if (!res.data.dealData.success) {
		console.error('LootScout: GG.deals API failed:', res.data.dealData);
		return {
			isValid: false,
			error: {
				name: 'GG.deals API Error',
				message: res.data.dealData.data?.message || 'GG.deals API request failed',
				code: res.data.dealData.data?.code || 0,
				status: res.data.dealData.data?.status || 0,
			} as ApiError,
		};
	}

	const ggDealsResponse = res.data.dealData.data as Record<string, unknown>;
	const ggDealsData = ggDealsResponse[res.data.appId];

	if (!steamAppData?.data?.price_overview || !ggDealsData) {
		return {
			isValid: false,
			error: {
				name: 'Data Error',
				message: 'Required data not found in API responses',
				code: 0,
				status: 0,
			} as ApiError,
		};
	}

	return { isValid: true, steamAppData, ggDealsData, hasValidReviews };
}