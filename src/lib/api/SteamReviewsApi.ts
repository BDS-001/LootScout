import { SteamApiParams } from './SteamStoreApi';
import { ApiResponse } from '../shared/types';
import { SteamReviewsResponse } from '../transformers/SteamReviewProcessor';
import { handleApiError } from '../utils/ErrorHandler';

export type SteamReviewApiResponse = ApiResponse<SteamReviewsResponse>;

function getSteamReviewBaseUrl(appId: string): string {
	return `https://store.steampowered.com/appreviews/${appId}`;
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

		const data = await result.json();

		return {
			success: true,
			data,
		};
	} catch (error) {
		return handleApiError(error, 'Steam Store');
	}
}
