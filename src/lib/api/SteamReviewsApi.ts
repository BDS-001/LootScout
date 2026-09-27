import { SteamApiParams } from './SteamStoreApi';
import { ApiResponse } from '../shared/types';
import { SteamReviewsResponse, SteamReviewQuerySummary } from '../transformers/SteamReviewProcessor';
import { handleApiError } from '../utils/ErrorHandler';

export type SteamReviewApiResponse = ApiResponse<SteamReviewsResponse>;

function getSteamReviewBaseUrl(appId: string): string {
	return `https://store.steampowered.com/appreviews/${appId}`;
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
		'success' in value &&
		typeof value.success === 'number' &&
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

	const url = new URL(getSteamReviewBaseUrl(appId));
	url.searchParams.set('json', '1');
	url.searchParams.set('cursor', '*');
	url.searchParams.set('num_per_page', '100');

	try {
		const result = await fetch(url.toString());

		if (!result.ok) {
			throw new Error(`HTTP ${result.status}: ${result.statusText}`);
		}

		const data: unknown = await result.json();

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
