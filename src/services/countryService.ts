import browser from 'webextension-polyfill';
import regionMap from '../constants/regionMap';
import { RegionCode } from '../shared/types';

export const loadCountryCode = async (): Promise<RegionCode> => {
	try {
		const result = await browser.storage.local.get('countryCode');
		const countryCode = result.countryCode || 'us';
		return countryCode as RegionCode;
	} catch (error) {
		console.error('Error loading country code:', error);
		return 'us';
	}
};

export const updateCountryCode = async (countryCode: string): Promise<void> => {
	if (!(countryCode in regionMap)) {
		throw new Error(`Invalid country code: ${countryCode}`);
	}

	try {
		await browser.runtime.sendMessage({
			action: 'updateCountryCode',
			countryCode,
		});
	} catch (error) {
		console.error('Error updating country code:', error);
		throw error;
	}
};

export const isValidCountryCode = (countryCode: string): countryCode is RegionCode => {
	return countryCode in regionMap;
};

export const getCountryInfo = (countryCode: RegionCode) => {
	return regionMap[countryCode];
};
