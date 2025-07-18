import browser from 'webextension-polyfill';
import regionMap, { DEFAULT_REGION } from '../constants/regionMap';
import { RegionCode } from '../shared/types';
import { getStorageItem, setStorageItem } from './StorageService';
import {
	parseSteamCountryCode,
	getBrowserLanguageRegion,
	isValidRegion,
} from '../parsers/LanguageParser';

const STORAGE_KEY = 'countryCode';

export const loadCountryCode = async (): Promise<RegionCode> => {
	const countryCode = await getStorageItem<RegionCode>(STORAGE_KEY);

	if (!countryCode) {
		try {
			const cookie = await browser.cookies.get({
				url: 'https://store.steampowered.com',
				name: 'steamCountry',
			});
			const steamRegion = parseSteamCountryCode(cookie?.value);

			if (steamRegion !== DEFAULT_REGION) {
				await setStorageItem(STORAGE_KEY, steamRegion);
				return steamRegion;
			}
		} catch (error) {
			console.warn('Steam detection failed:', error);
		}

		const browserRegion = getBrowserLanguageRegion();
		await setStorageItem(STORAGE_KEY, browserRegion);
		return browserRegion;
	}

	return countryCode;
};

export const updateCountryCode = async (countryCode: string): Promise<void> => {
	if (!isValidRegion(countryCode)) {
		throw new Error(`Invalid country code: ${countryCode}`);
	}

	await setStorageItem(STORAGE_KEY, countryCode);
};

export const getCountryInfo = (countryCode: RegionCode) => {
	return regionMap[countryCode];
};
