import { SteamApiParams, SteamApiResponse, SteamPriceOverview } from '../shared/types';
import { handleApiError } from '../utils/ErrorHandler';

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

		const data = await result.json();

		if (data[appId]?.data?.price_overview) {
			data[appId].data.price_overview = normalizeSteamPriceOverview(
				data[appId].data.price_overview
			);
		}

		return {
			success: true,
			data,
		};
	} catch (error) {
		return handleApiError(error, 'Steam Store');
	}
}
