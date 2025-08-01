import { RegionCode, ApiResponse } from '../shared/types';
import { handleApiError } from '../utils/ErrorHandler';
import { debug } from '../utils/debug';

// GG.deals specific types
export interface GgDealsGameData {
	title: string;
	url: string;
	prices: {
		currentRetail: number;
		currentKeyshops: number;
		historicalRetail: number;
		historicalKeyshops: number;
		currency: string;
	};
}

export interface GgDealsApiParams {
	appId: string;
	apiKey: string;
	region: RegionCode;
}

export type GgDealsApiResponse = ApiResponse<Record<string, GgDealsGameData | null>>;

const GG_DEALS_BASE_URL = 'https://api.gg.deals/v1/prices/by-steam-app-id/';
const dealDataProxy = import.meta.env.VITE_PROXY_URL;

const fetchFromApi = async (appId: string, apiKey: string, region: string) => {
	const url = `${GG_DEALS_BASE_URL}?ids=${appId}&key=${apiKey}&region=${region}`;
	return fetch(url);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateDelay = (retryCount: number, baseDelay: number) =>
	baseDelay * Math.pow(2, retryCount);

const isRetryableError = (response: Response) => response.status >= 500 || response.status === 408;

const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, { ...options, signal: controller.signal });
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
};

const fetchFromProxy = async (appId: string, region: string, retryCount = 0) => {
	const MAX_RETRIES = 6; // More retries for cold starts
	const BASE_DELAY = 500;
	const TIMEOUT = 9000; // Just under Vercel's 10s limit

	try {
		const response = await fetchWithTimeout(
			dealDataProxy,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ appId, region }),
			},
			TIMEOUT
		);

		if (isRetryableError(response) && retryCount < MAX_RETRIES) {
			const delay = calculateDelay(retryCount, BASE_DELAY);
			debug.log(
				`Proxy error ${response.status}, retrying in ${delay}ms... (${retryCount + 1}/${MAX_RETRIES})`
			);
			await sleep(delay);
			return fetchFromProxy(appId, region, retryCount + 1);
		}

		return response;
	} catch (error) {
		if (retryCount < MAX_RETRIES) {
			const delay = calculateDelay(retryCount, BASE_DELAY);
			debug.log(`Network error, retrying in ${delay}ms... (${retryCount + 1}/${MAX_RETRIES})`);
			await sleep(delay);
			return fetchFromProxy(appId, region, retryCount + 1);
		}
		throw error;
	}
};

const processResponse = (data: {
	success?: boolean;
	data?: Record<string, any>;
}): GgDealsApiResponse => {
	if (data.success && data.data) {
		Object.keys(data.data).forEach((appId) => {
			const gameData = data.data![appId];
			if (gameData?.prices) {
				gameData.prices.currentRetail = Math.round(parseFloat(gameData.prices.currentRetail) * 100);
				gameData.prices.historicalRetail = Math.round(
					parseFloat(gameData.prices.historicalRetail) * 100
				);
			}
		});
	}
	return data as GgDealsApiResponse;
};

export default async function fetchGgDealsData(
	params: GgDealsApiParams
): Promise<GgDealsApiResponse> {
	const { appId, apiKey, region } = params;

	try {
		let result;
		if (apiKey) {
			debug.log('Fetching data via direct API (user key)');
			result = await fetchFromApi(appId, apiKey, region);
		} else if (dealDataProxy) {
			debug.log('Fetching data via proxy server');
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
