import browser from 'webextension-polyfill';
import parseSteamPageUrl from './parsers/steamAppIdParser';
import { injectLootScoutContainer, updateContainerState } from './ui/LootScoutContainer';
import { GameDataResponse, ApiError } from './shared/types';
import injectCSS from './utils/injectCSS';

async function initializeContentScript(): Promise<void> {
	injectCSS();

	const { appId, appName } = parseSteamPageUrl();
	if (!appId || !appName) return;

	const container = injectLootScoutContainer(appName);
	if (!container) return;

	try {
		const response = (await browser.runtime.sendMessage({
			action: 'getAppData',
			appId,
		})) as GameDataResponse;

		console.log('LootScout API Response:', response);

		if (response.success) {
			const currentCountry = await browser.runtime.sendMessage({
				action: 'getCountryCode',
			});

			updateContainerState(container, {
				status: 'success',
				gameData: response,
				appName,
				countryCode: currentCountry,
			});
		} else {
			updateContainerState(container, {
				status: 'error',
				error: response.data as ApiError,
				appName,
			});
		}
	} catch (error) {
		updateContainerState(container, {
			status: 'error',
			error: {
				name: 'CommunicationError',
				message: 'Failed to communicate with extension background',
				code: 0,
				status: 0,
			},
			appName,
		});

		console.error('LootScout: Error communicating with background script:', error);
	}
}

// Entry Point
if (window.location.href.includes('store.steampowered.com/app/')) {
	initializeContentScript();
}
