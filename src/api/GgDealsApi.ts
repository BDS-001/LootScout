import { GgDealsApiParams, GgDealsApiResponse } from '../shared/types';
import { handleApiError } from '../utils/ErrorHandler';

const GG_DEALS_BASE_URL = 'https://api.gg.deals/v1/prices/by-steam-app-id/';
const dealDataProxy = import.meta.env.VITE_PROXY_URL;

const fetchFromApi = async (appId: string, apiKey: string, region: string) => {
	const url = `${GG_DEALS_BASE_URL}?ids=${appId}&key=${apiKey}&region=${region}`;
	return fetch(url);
};

const fetchFromProxy = async (appId: string, region: string, retryCount = 0) => {
	try {
		const response = await fetch(dealDataProxy, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ appId, region }),
		});

		if (response.status >= 500 && retryCount < 2) {
			console.log(`LootScout: Proxy error ${response.status}, retrying... (${retryCount + 1}/2)`);
			await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1))); // Progressive delay
			return fetchFromProxy(appId, region, retryCount + 1);
		}

		return response;
	} catch (error) {
		if (retryCount < 1) {
			console.log('LootScout: Network error, retrying... (1/1)');
			await new Promise((resolve) => setTimeout(resolve, 2000));
			return fetchFromProxy(appId, region, retryCount + 1);
		}
		throw error;
	}
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
			console.log('LootScout: Fetching data via direct API (user key)');
			result = await fetchFromApi(appId, apiKey, region);
		} else if (dealDataProxy) {
			console.log('LootScout: Fetching data via proxy server');
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
