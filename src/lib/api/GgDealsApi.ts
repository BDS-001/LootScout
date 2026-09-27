import { RegionCode, ApiResponse } from '../shared/types';
import { handleApiError } from '../utils/ErrorHandler';
import { debug } from '../utils/debug';

// GG.deals specific types
export interface GgDealsGameData {
	title: string;
	url: string;
	prices: {
		currentRetail: number;
		historicalRetail: number;
		currency: string;
	};
}

export interface GgDealsApiParams {
	appId: string;
	apiKey: string;
	region: RegionCode;
}

export type GgDealsApiResponse = ApiResponse<Record<string, GgDealsGameData | null>>;

// The wire format GG.deals actually sends: prices arrive as numeric strings, not numbers.
interface RawGgDealsGameData {
	title: string;
	url: string;
	prices: {
		currentRetail: string;
		historicalRetail: string;
		currency: string;
	};
}

interface RawGgDealsSuccessPayload {
	success: true;
	data?: Record<string, RawGgDealsGameData | null>;
}

interface RawGgDealsErrorPayload {
	success: false;
	data?: { message?: string; code?: number; status?: number };
}

type RawGgDealsPayload = RawGgDealsSuccessPayload | RawGgDealsErrorPayload;

function isRawGgDealsGameData(value: unknown): value is RawGgDealsGameData {
	if (
		typeof value !== 'object' ||
		value === null ||
		!('title' in value) ||
		typeof value.title !== 'string' ||
		!('url' in value) ||
		typeof value.url !== 'string' ||
		!('prices' in value)
	) {
		return false;
	}

	const { prices } = value;
	return (
		typeof prices === 'object' &&
		prices !== null &&
		'currentRetail' in prices &&
		typeof prices.currentRetail === 'string' &&
		'historicalRetail' in prices &&
		typeof prices.historicalRetail === 'string' &&
		'currency' in prices &&
		typeof prices.currency === 'string'
	);
}

function isRawGgDealsPayload(value: unknown): value is RawGgDealsPayload {
	if (typeof value !== 'object' || value === null || !('success' in value)) {
		return false;
	}
	if (typeof value.success !== 'boolean') {
		return false;
	}
	if (!value.success) {
		return true;
	}
	if (!('data' in value) || value.data === undefined) {
		return true;
	}

	const { data } = value;
	return (
		typeof data === 'object' &&
		data !== null &&
		Object.values(data).every((entry) => entry === null || isRawGgDealsGameData(entry))
	);
}

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
	const MAX_RETRIES = 5;
	const BASE_DELAY = 500;
	const TIMEOUT = 9000;

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

function toGgDealsGameData(raw: RawGgDealsGameData): GgDealsGameData {
	return {
		title: raw.title,
		url: raw.url,
		prices: {
			currentRetail: Math.round(parseFloat(raw.prices.currentRetail) * 100),
			historicalRetail: Math.round(parseFloat(raw.prices.historicalRetail) * 100),
			currency: raw.prices.currency,
		},
	};
}

function processResponse(payload: RawGgDealsPayload): GgDealsApiResponse {
	if (!payload.success) {
		return {
			success: false,
			data: {
				name: 'GG.deals API Error',
				message: payload.data?.message || 'GG.deals API request failed',
				code: payload.data?.code || 0,
				status: payload.data?.status || 0,
			},
		};
	}

	const entries = Object.entries(payload.data ?? {}).map(
		([appId, raw]) => [appId, raw ? toGgDealsGameData(raw) : null] as const
	);

	return { success: true, data: Object.fromEntries(entries) };
}

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

		const data: unknown = await result.json();

		if (!isRawGgDealsPayload(data)) {
			throw new Error('Unexpected GG.deals API response shape');
		}

		return processResponse(data);
	} catch (error) {
		return handleApiError(error, 'GG Deals');
	}
}
