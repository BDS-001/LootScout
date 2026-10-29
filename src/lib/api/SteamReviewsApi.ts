import { SteamApiParams } from './SteamStoreApi';
import { ApiResponse } from '../shared/types';
import {
	SteamReviewsResponse,
	SteamReviewQuerySummary,
} from '../transformers/SteamReviewProcessor';
import { handleApiError } from '../utils/ErrorHandler';

export type SteamReviewApiResponse = ApiResponse<SteamReviewsResponse>;

const STEAM_REVIEWS_URL = 'https://api.steampowered.com/IUserReviewsService/GetAppReviews/v1/';

function buildSteamReviewUrl(appId: string): string {
	const url = new URL(STEAM_REVIEWS_URL);
	url.searchParams.set(
		'input_json',
		JSON.stringify({ appid: Number(appId), cursor: '*', num_per_page: 100, purchase_type: 1 })
	);
	return url.toString();
}

function isSteamReviewQuerySummary(value: unknown): value is SteamReviewQuerySummary {
	return (
		typeof value === 'object' &&
		value !== null &&
		'num_reviews' in value &&
		typeof value.num_reviews === 'number' &&
		'review_score' in value &&
		typeof value.review_score === 'number' &&
		'review_score_desc' in value &&
		typeof value.review_score_desc === 'string' &&
		'total_positive' in value &&
		typeof value.total_positive === 'number' &&
		'total_negative' in value &&
		typeof value.total_negative === 'number' &&
		'total_reviews' in value &&
		typeof value.total_reviews === 'number'
	);
}

function isSteamReviewsResponse(value: unknown): value is SteamReviewsResponse {
	return (
		typeof value === 'object' &&
		value !== null &&
		'query_summary' in value &&
		isSteamReviewQuerySummary(value.query_summary) &&
		'reviews' in value &&
		Array.isArray(value.reviews)
	);
}

export default async function fetchSteamReviewData(
	params: SteamApiParams
): Promise<SteamReviewApiResponse> {
	const { appId } = params;

	try {
		const result = await fetch(buildSteamReviewUrl(appId));

		if (!result.ok) {
			throw new Error(`HTTP ${result.status}: ${result.statusText}`);
		}

		const body: unknown = await result.json();

		if (typeof body !== 'object' || body === null || !('response' in body)) {
			throw new Error('Unexpected Steam Reviews API response shape');
		}

		const data = body.response;
		if (!isSteamReviewsResponse(data)) {
			throw new Error('Unexpected Steam Reviews API response shape');
		}

		return {
			success: true,
			data,
		};
	} catch (error) {
		return handleApiError(error, 'Steam Store');
	}
}
