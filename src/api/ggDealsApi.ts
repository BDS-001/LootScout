import { GgDealsApiParams, GgDealsApiResponse } from '../shared/types';
import { handleApiError } from '../utils/apiErrorHandler';

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

		if (data.success && data.data) {
			Object.keys(data.data).forEach((appId) => {
				const gameData = data.data[appId];
				if (gameData && gameData.prices) {
					gameData.prices.currentRetail = Math.round(
						parseFloat(gameData.prices.currentRetail) * 100
					);
					gameData.prices.historicalRetail = Math.round(
						parseFloat(gameData.prices.historicalRetail) * 100
					);
				}
			});
		}

		return data;
	} catch (error) {
		return handleApiError(error, 'GG Deals');
	}
}
