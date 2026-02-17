import browser from 'webextension-polyfill';
import { getStorageItem, setStorageItem, removeStorageItem } from './StorageService';
import { RegionCode, AppSettings, ModifierSettings } from '../shared/types';
import regionMap, { DEFAULT_REGION } from '../constants/regionMap';
import { DEFAULT_SETTINGS } from '../constants/defaultSettings';
import {
	parseSteamCountryCode,
	getBrowserLanguageRegion,
	isValidRegion,
} from '../parsers/LanguageParser';
import { debug } from '../utils/debug';

const REGION_MANUALLY_SET_KEY = 'region_manually_set';

const SETTINGS_KEY = 'lootscout_settings';
const LEGACY_API_KEY = 'apiKey';

let legacyApiKeyMigrated = false;

const mergeModifiers = (stored?: ModifierSettings): ModifierSettings => {
	return stored ?? DEFAULT_SETTINGS.modifiers;
};

export const getSettings = async (): Promise<AppSettings> => {
	const settings = await getStorageItem<Partial<AppSettings>>(SETTINGS_KEY);
	const merged: AppSettings = {
		...DEFAULT_SETTINGS,
		...settings,
		modifiers: mergeModifiers(settings?.modifiers),
	};

	if (!legacyApiKeyMigrated && !merged.apiKey) {
		legacyApiKeyMigrated = true;
		const legacyKey = await getStorageItem<string>(LEGACY_API_KEY);
		if (legacyKey) {
			merged.apiKey = legacyKey;
			await setStorageItem(SETTINGS_KEY, merged);
			await removeStorageItem(LEGACY_API_KEY);
		}
	}

	return merged;
};

export const updateSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
	const currentSettings = await getSettings();
	const updatedSettings = { ...currentSettings, ...newSettings };
	await setStorageItem(SETTINGS_KEY, updatedSettings);
};

export const getApiKey = async (): Promise<string> => {
	const settings = await getSettings();
	return settings.apiKey;
};

export const updateApiKey = async (apiKey: string): Promise<void> => {
	await updateSettings({ apiKey });
};

// Region-specific functions with auto-detection
export const getRegion = async (): Promise<RegionCode> => {
	const settings = await getSettings();
	const isManuallySet = await getStorageItem<boolean>(REGION_MANUALLY_SET_KEY);

	if (!isManuallySet && settings.region === DEFAULT_REGION) {
		const detectedRegion = await detectRegion();
		await updateSettings({ region: detectedRegion });
		return detectedRegion;
	}

	return settings.region;
};

export const updateRegion = async (region: RegionCode): Promise<void> => {
	if (!isValidRegion(region)) {
		throw new Error(`Invalid region code: ${region}`);
	}

	await updateSettings({ region });
	await setStorageItem(REGION_MANUALLY_SET_KEY, true);
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
		debug.warn('Steam region detection failed:', error);
	}

	return getBrowserLanguageRegion();
};

export const getRegionInfo = (regionCode: RegionCode) => {
	return regionMap[regionCode];
};
