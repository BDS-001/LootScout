import browser from 'webextension-polyfill';
import { getStorageItem, setStorageItem, removeStorageItem } from './StorageService';
import { RegionCode, AppSettings, RaritySettings } from '../shared/types';
import regionMap, { DEFAULT_REGION } from '../constants/regionMap';
import {
	parseSteamCountryCode,
	getBrowserLanguageRegion,
	isValidRegion,
} from '../parsers/LanguageParser';
import { debug } from '../utils/debug';

const DEFAULT_SETTINGS: AppSettings = {
	region: DEFAULT_REGION,
	rarity: {
		includePlaytime: true,
		includeReviewScore: true,
	},
	apiKey: '',
	modifiers: {
		playtime: {
			criticalBonus: { effect: 2, threshold: 60, active: true },
			bonus: { effect: 1, threshold: 30, active: true },
			penalty: { effect: -1, threshold: 5, active: true },
			criticalPenalty: { effect: 0, threshold: 0, active: false },
		},
		review: {
			criticalBonus: { effect: 0, threshold: 0, active: false },
			bonus: { effect: 1, threshold: 9, active: true },
			penalty: { effect: -1, threshold: 4, active: true },
			criticalPenalty: { effect: -2, threshold: 1, active: true },
		},
	},
};

const REGION_MANUALLY_SET_KEY = 'region_manually_set';

const SETTINGS_KEY = 'lootscout_settings';
const LEGACY_API_KEY = 'apiKey';

let legacyApiKeyMigrated = false;

export const getSettings = async (): Promise<AppSettings> => {
	const settings = await getStorageItem<AppSettings>(SETTINGS_KEY);
	const merged = { ...DEFAULT_SETTINGS, ...settings };

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
