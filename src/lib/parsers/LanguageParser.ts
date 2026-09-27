import { RegionCode } from '../shared/types';
import regionMap, { DEFAULT_REGION, languageOverrides } from '../constants/regionMap';

export function isValidRegion(region: string): region is RegionCode {
	return region in regionMap;
}

export function parseSteamCountryCode(cookieValue: string | null | undefined): RegionCode {
	if (!cookieValue) return DEFAULT_REGION;

	const countryCode = cookieValue.split('%7C')[0].toLowerCase();
	return isValidRegion(countryCode) ? countryCode : DEFAULT_REGION;
}

export function getBrowserLanguageRegion(): RegionCode {
	try {
		const [languageCode, countryCode] = navigator.language.split('-');
		const lowerCountryCode = countryCode?.toLowerCase();

		if (lowerCountryCode && isValidRegion(lowerCountryCode)) {
			return lowerCountryCode;
		}

		const override = languageOverrides[languageCode];
		if (override) return override;

		return isValidRegion(languageCode) ? languageCode : DEFAULT_REGION;
	} catch {
		return DEFAULT_REGION;
	}
}
