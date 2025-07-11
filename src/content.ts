import browser from 'webextension-polyfill';
import parseSteamPageUrl from './parsers/steamAppIdParser';
import { createLootScoutContentRightCol } from './components/createLootScoutContent';
import { GameDataResponse } from './shared/types';
import injectCSS from './utils/injectCSS';
import { loadCountryCode } from './services/countryService';
import { getApiKeyWithFallback } from './api/apiKeyService';

async function initializeContentScript(): Promise<void> {
	injectCSS();

	const { appId } = parseSteamPageUrl();
	if (!appId) return;

	const apiKey = await getApiKeyWithFallback();

	if (!apiKey) {
		console.error(
			'LootScout: API key not found. Please check environment configuration or configure your API key in the extension popup.'
		);
		return;
	}

	try {
		const currentCountry = await loadCountryCode();

		const response: GameDataResponse = await browser.runtime.sendMessage({
			action: 'getAppData',
			appId,
			apiKey,
		});

		console.log('LootScout API Response:', response);

		if (response.success) {
			createLootScoutContentRightCol(response, currentCountry);
		} else {
			console.error('LootScout: Failed to fetch game data:', {
				responseSuccess: response.success,
				error: response.data,
			});
		}
	} catch (error) {
		console.error('LootScout: Error communicating with background script:', error);
	}
}

// Entry Point
if (window.location.href.includes('store.steampowered.com/app/')) {
	initializeContentScript();
}
