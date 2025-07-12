import { GgDealsApiParams, GgDealsApiResponse } from '../shared/types';
import { handleApiError } from '../utils/apiErrorHandler';

const GG_DEALS_BASE_URL = 'https://api.gg.deals/v1/prices/by-steam-app-id/';
const dealDataProxy = import.meta.env.VITE_PROXY_URL;

const fetchFromApi = async (appId: string, apiKey: string, region: string) => {
	const url = `${GG_DEALS_BASE_URL}?ids=${appId}&key=${apiKey}&region=${region}`;
	return fetch(url);
};

const fetchFromProxy = async (appId: string, region: string) => {
	return fetch(dealDataProxy, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ appId, region }),
	});
};

const processResponse = (data: any): GgDealsApiResponse => {
	if (data.success && data.data) {
		Object.keys(data.data).forEach((appId) => {
			const gameData = data.data[appId];
			if (gameData?.prices) {
				gameData.prices.currentRetail = Math.round(parseFloat(gameData.prices.currentRetail) * 100);
				gameData.prices.historicalRetail = Math.round(
					parseFloat(gameData.prices.historicalRetail) * 100
				);
			}
		});
	}
	return data;
};

export default async function fetchGgDealsData(
	params: GgDealsApiParams
): Promise<GgDealsApiResponse> {
	const { appId, apiKey, region } = params;

	try {
		let result;
		if (apiKey) {
			console.log('Data from direct API');
			result = await fetchFromApi(appId, apiKey, region);
		} else if (dealDataProxy) {
			console.log('Data from proxy server');
			result = await fetchFromProxy(appId, region);
		} else {
			throw new Error('No API key provided and no proxy configured');
		}

		if (!result.ok) {
			throw new Error(`HTTP ${result.status}: ${result.statusText}`);
		}

		const data = await result.json();
		const processedData = processResponse(data);

		return processedData;
	} catch (error) {
		return handleApiError(error, 'GG Deals');
	}
}
