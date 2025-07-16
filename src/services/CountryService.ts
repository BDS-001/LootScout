import regionMap from '../constants/regionMap';
import { RegionCode } from '../shared/types';
import { getStorageItem, setStorageItem } from './StorageService';

export const loadCountryCode = async (): Promise<RegionCode> => {
	const countryCode = await getStorageItem<RegionCode>('countryCode');
	return countryCode || 'us';
};

export const updateCountryCode = async (countryCode: string): Promise<void> => {
	if (!isValidCountryCode(countryCode)) {
		throw new Error(`Invalid country code: ${countryCode}`);
	}

	await setStorageItem('countryCode', countryCode);
};

export const isValidCountryCode = (countryCode: string): countryCode is RegionCode => {
	return countryCode in regionMap;
};

export const getCountryInfo = (countryCode: RegionCode) => {
	return regionMap[countryCode];
};
