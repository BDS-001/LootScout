import { RegionCode, ApiResponse } from '../shared/types';
import { handleApiError } from '../utils/ErrorHandler';

// Steam Store API types
export interface SteamPriceOverview {
	currency: string;
	initial: number;
	final: number;
	discount_percent: number;
	initial_formatted?: string;
	final_formatted?: string;
}

export interface SteamAppData {
	success: boolean;
	data?: {
		name: string;
		steam_appid: number;
		is_free: boolean;
		price_overview?: SteamPriceOverview;
		release_date?: {
			coming_soon: boolean;
			date: string;
		};
	};
}

export interface SteamApiParams {
	appId: string;
	region: RegionCode;
}

export type SteamApiResponse = ApiResponse<Record<string, SteamAppData>>;

function isSteamPriceOverview(value: unknown): value is SteamPriceOverview {
	return (
		typeof value === 'object' &&
		value !== null &&
		'currency' in value &&
		typeof value.currency === 'string' &&
		'initial' in value &&
		typeof value.initial === 'number' &&
		'final' in value &&
		typeof value.final === 'number' &&
		'discount_percent' in value &&
		typeof value.discount_percent === 'number'
	);
}

function isSteamReleaseDate(value: unknown): value is NonNullable<SteamAppData['data']>['release_date'] {
	return (
		typeof value === 'object' &&
		value !== null &&
		'coming_soon' in value &&
		typeof value.coming_soon === 'boolean' &&
		'date' in value &&
		typeof value.date === 'string'
	);
}

function isSteamAppDataPayload(value: unknown): value is SteamAppData['data'] {
	return (
		typeof value === 'object' &&
		value !== null &&
		'name' in value &&
		typeof value.name === 'string' &&
		'steam_appid' in value &&
		typeof value.steam_appid === 'number' &&
		'is_free' in value &&
		typeof value.is_free === 'boolean' &&
		(!('price_overview' in value) ||
			value.price_overview === undefined ||
			isSteamPriceOverview(value.price_overview)) &&
		(!('release_date' in value) ||
			value.release_date === undefined ||
			isSteamReleaseDate(value.release_date))
	);
}

function isSteamAppData(value: unknown): value is SteamAppData {
	if (typeof value !== 'object' || value === null || !('success' in value)) {
		return false;
	}
	if (typeof value.success !== 'boolean') {
		return false;
	}
	if (!value.success) {
		return true;
	}

	return 'data' in value && isSteamAppDataPayload(value.data);
}

function isSteamStoreApiData(value: unknown): value is Record<string, SteamAppData> {
	return typeof value === 'object' && value !== null && Object.values(value).every(isSteamAppData);
}

function normalizeSteamPriceOverview(priceOverview: SteamPriceOverview): SteamPriceOverview {
	const normalized = { ...priceOverview };

	if (normalized.discount_percent === 100) {
		normalized.final = 0;
	}

	return normalized;
}

const STEAM_STORE_BASE_URL = 'https://store.steampowered.com/api/appdetails';

export default async function fetchSteamStoreData(
	params: SteamApiParams
): Promise<SteamApiResponse> {
	const { appId, region } = params;

	const url = new URL(STEAM_STORE_BASE_URL);
	url.searchParams.set('appids', appId);
	url.searchParams.set('cc', region);
	url.searchParams.set('filters', 'basic,price_overview,release_date');

	try {
		const result = await fetch(url.toString());

		if (!result.ok) {
			throw new Error(`HTTP ${result.status}: ${result.statusText}`);
		}

		const data: unknown = await result.json();

		if (!isSteamStoreApiData(data)) {
			throw new Error('Unexpected Steam Store API response shape');
		}

		for (const entry of Object.values(data)) {
			if (entry.data?.price_overview) {
				entry.data.price_overview = normalizeSteamPriceOverview(entry.data.price_overview);
			}
		}

		return {
			success: true,
			data,
		};
	} catch (error) {
		return handleApiError(error, 'Steam Store');
	}
}
