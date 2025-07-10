import browser from 'webextension-polyfill';
import fetchCombinedGameData from './api/combinedGameData';
import { normalizeResponse } from './helpers/formatResponse';
import { CombinedGameDataParams } from './shared/types';
import { parseSteamCountryCode } from './parsers/steamLanguageParser';
import regionMap from './constants/regionMap';

console.log('Hello from the background!');

async function initializeCountryCode(): Promise<void> {
	try {
		const cookie = await browser.cookies.get({
			url: 'https://store.steampowered.com',
			name: 'steamCountry',
		});

		const countryCode = parseSteamCountryCode(cookie?.value);

		if (countryCode in regionMap) {
			await browser.storage.local.set({ countryCode });
			console.log('Saved country code:', countryCode);
		} else {
			console.log('Invalid country code, using default');
			await browser.storage.local.set({ countryCode: 'us' });
		}
	} catch (error) {
		console.log('Could not detect Steam country, using default:', error);
		await browser.storage.local.set({ countryCode: 'us' });
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
			const countryCode = msg.countryCode;

			if (countryCode in regionMap) {
				await browser.storage.local.set({ countryCode });
				console.log('Updated country code:', countryCode);
				return { success: true };
			} else {
				console.log('Invalid country code provided:', countryCode);
				return { success: false, error: 'Invalid country code' };
			}
		} catch (error) {
			console.error('Error updating country code:', error);
			return { success: false, error: error };
		}
	} else if (msg.action === 'getAppData') {
		const regionStorage = await browser.storage.local.get('countryCode');
		console.log(regionStorage);

		const region = regionStorage.countryCode || 'us';

		const params: CombinedGameDataParams = {
			appId: msg.appId,
			apiKey: msg.apiKey,
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

		// return true to indicate we’ll call sendResponse asynchronously
		return true;
	}
});
