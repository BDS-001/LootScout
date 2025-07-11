import browser from 'webextension-polyfill';
import parseSteamPageUrl from './parsers/steamAppIdParser';
import { createLootScoutContentRightCol } from './ui/createLootScoutContent';
import { GameDataResponse } from './shared/types';
import injectCSS from './utils/injectCSS';

async function initializeContentScript(): Promise<void> {
	injectCSS();

	const { appId } = parseSteamPageUrl();
	if (!appId) return;

	try {
		const response: GameDataResponse = await browser.runtime.sendMessage({
			action: 'getAppData',
			appId,
		});

		console.log('LootScout API Response:', response);

		if (response.success) {
			const currentCountry = await browser.runtime.sendMessage({
				action: 'getCountryCode',
			});
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
