import browser from 'webextension-polyfill';
import fetchCombinedGameData from './api/combinedGameData';
import { normalizeResponse } from './helpers/formatResponse';
import { CombinedGameDataParams } from './shared/types';
import { parseSteamCountryCode } from './parsers/steamLanguageParser';
import { setStorageItem, getStorageItem } from './services/storageService';
import { isValidCountryCode, loadCountryCode, updateCountryCode } from './services/countryService';
import { getApiKeyWithFallback } from './api/apiKeyService';

console.log('Hello from the background!');

async function initializeCountryCode(): Promise<void> {
	try {
		const cookie = await browser.cookies.get({
			url: 'https://store.steampowered.com',
			name: 'steamCountry',
		});

		const countryCode = parseSteamCountryCode(cookie?.value);

		if (isValidCountryCode(countryCode)) {
			await setStorageItem('countryCode', countryCode);
			console.log('Saved country code:', countryCode);
		} else {
			console.log('Invalid country code, using default');
			await setStorageItem('countryCode', 'us');
		}
	} catch (error) {
		console.log('Could not detect Steam country, using default:', error);
		await setStorageItem('countryCode', 'us');
	}
}

browser.runtime.onInstalled.addListener(async (details) => {
	console.log('Extension installed:', details);

	if (details.reason === 'install') {
		await initializeCountryCode();
	}
});

browser.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
	if (msg.action === 'updateCountryCode') {
		try {
			await updateCountryCode(msg.countryCode);
			console.log('Updated country code:', msg.countryCode);
			return { success: true };
		} catch (error) {
			console.error('Error updating country code:', error);
			return { success: false, error: error };
		}
	} else if (msg.action === 'getAppData') {
		const region = await loadCountryCode();
		console.log('Using region:', region);

		const apiKey = await getApiKeyWithFallback();

		if (!apiKey) {
			console.error(
				'LootScout: API key not found. Please check environment configuration or configure your API key in the extension popup.'
			);
			return { success: false, data: 'API key not found' };
		}

		const params: CombinedGameDataParams = {
			appId: msg.appId,
			apiKey,
			region,
		};

		try {
			const res = await fetchCombinedGameData(params);
			console.log('Raw combined data response:', res);
			const normalizedRes = normalizeResponse(res);
			console.log('Normalized response:', normalizedRes);
			return normalizedRes;
		} catch (error) {
			console.error('Error fetching combined game data:', error);
			return { success: false, data: error };
		}
	}
});
