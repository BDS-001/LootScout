import { RegionCode } from '../shared/types';
import { isValidCountryCode } from '../services/countryService';

export function parseSteamCountryCode(cookieValue: string | null | undefined): RegionCode {
	if (!cookieValue) {
		return 'us';
	}

	const countryCode = cookieValue.split('%7C')[0].toLowerCase();

	if (isValidCountryCode(countryCode)) {
		return countryCode;
	}

	return 'us';
}

export default function getSteamCountryCode(): RegionCode {
	const match = document.cookie.match(/(?:^|;\s*)steamCountry=([^;]*)/);
	return parseSteamCountryCode(match?.[1]);
}
