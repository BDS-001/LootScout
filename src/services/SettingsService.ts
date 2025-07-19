import browser from 'webextension-polyfill';
import { getStorageItem, setStorageItem } from './StorageService';
import { RegionCode, AppSettings, RaritySettings } from '../shared/types';
import regionMap, { DEFAULT_REGION } from '../constants/regionMap';
import {
	parseSteamCountryCode,
	getBrowserLanguageRegion,
	isValidRegion,
} from '../parsers/LanguageParser';

const DEFAULT_SETTINGS: AppSettings = {
	region: DEFAULT_REGION,
	rarity: {
		includePlaytime: false,
		includeReviewScore: false,
	},
};

const SETTINGS_KEY = 'lootscout_settings';

export const getSettings = async (): Promise<AppSettings> => {
	const settings = await getStorageItem<AppSettings>(SETTINGS_KEY);
	return settings || DEFAULT_SETTINGS;
};

export const updateSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
	const currentSettings = await getSettings();
	const updatedSettings = { ...currentSettings, ...newSettings };
	await setStorageItem(SETTINGS_KEY, updatedSettings);
};

export const getRaritySettings = async (): Promise<RaritySettings> => {
	const settings = await getSettings();
	return settings.rarity;
};

export const updateRaritySettings = async (
	raritySettings: Partial<RaritySettings>
): Promise<void> => {
	const currentSettings = await getSettings();
	const updatedSettings = {
		...currentSettings,
		rarity: { ...currentSettings.rarity, ...raritySettings },
	};
	await setStorageItem(SETTINGS_KEY, updatedSettings);
};

// Region-specific functions with auto-detection
export const getRegion = async (): Promise<RegionCode> => {
	const settings = await getSettings();

	// If region is still default, try auto-detection
	if (settings.region === DEFAULT_REGION) {
		const detectedRegion = await detectRegion();
		if (detectedRegion !== DEFAULT_REGION) {
			await updateRegion(detectedRegion);
			return detectedRegion;
		}
	}

	return settings.region;
};

export const updateRegion = async (region: RegionCode): Promise<void> => {
	if (!isValidRegion(region)) {
		throw new Error(`Invalid region code: ${region}`);
	}

	const currentSettings = await getSettings();
	const updatedSettings = { ...currentSettings, region };
	await setStorageItem(SETTINGS_KEY, updatedSettings);
};

const detectRegion = async (): Promise<RegionCode> => {
	try {
		const cookie = await browser.cookies.get({
			url: 'https://store.steampowered.com',
			name: 'steamCountry',
		});
		const steamRegion = parseSteamCountryCode(cookie?.value);

		if (steamRegion !== DEFAULT_REGION) {
			return steamRegion;
		}
	} catch (error) {
		console.warn('Steam region detection failed:', error);
	}

	return getBrowserLanguageRegion();
};

export const getRegionInfo = (regionCode: RegionCode) => {
	return regionMap[regionCode];
};
