import { GgDealsApiParams, GgDealsApiResponse } from '../shared/types';

const GG_DEALS_BASE_URL = 'https://api.gg.deals/v1/prices/by-steam-app-id/';

export default async function fetchGgDealsData(
	params: GgDealsApiParams
): Promise<GgDealsApiResponse> {
	const { appId, apiKey, region } = params;

	const url = `${GG_DEALS_BASE_URL}?ids=${appId}&key=${apiKey}&region=${region}`;

	try {
		console.log('Fetching GG Deals data:', url);
		const result = await fetch(url);

		if (!result.ok) {
			throw new Error(`HTTP ${result.status}: ${result.statusText}`);
		}

		const data = await result.json();
		console.log('GG Deals API result:', data);

		return data;
	} catch (error) {
		console.error('GG Deals API error:', error);
		return {
			success: false,
			data: {
				name: 'Network Error',
				message: 'Error fetching data from GG Deals',
				code: 0,
				status: 0,
			},
			error,
		};
	}
}
