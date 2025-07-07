import { SteamApiParams, SteamApiResponse } from '../shared/types';

const STEAM_STORE_BASE_URL = 'https://store.steampowered.com/api/appdetails';

export default async function fetchSteamStoreData(
	params: SteamApiParams
): Promise<SteamApiResponse> {
	const { appId, region } = params;

	const url = new URL(STEAM_STORE_BASE_URL);
	url.searchParams.set('appids', appId);
	url.searchParams.set('cc', region);

	try {
		const result = await fetch(url.toString());

		if (!result.ok) {
			throw new Error(`HTTP ${result.status}: ${result.statusText}`);
		}

		const data = await result.json();
		console.log('Steam Store API result:', data);

		return {
			success: true,
			data,
		};
	} catch (error) {
		console.error('Steam Store API error:', error);
		return {
			success: false,
			data: {
				name: 'Network Error',
				message: 'Error fetching data from Steam Store',
				code: 0,
				status: 0,
			},
			error,
		};
	}
}
