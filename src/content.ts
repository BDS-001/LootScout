import browser from 'webextension-polyfill';
import parseSteamPageUrl from './parsers/SteamParser';
import { injectLootScoutContainer, updateContainerState } from './ui/LootScoutContainer';
import { GameDataResponse, ApiError } from './shared/types';
import injectCSS from './utils/injectCSS';
import { debug } from './utils/debug';

async function initializeContentScript(): Promise<void> {
	injectCSS();

	const { appId } = parseSteamPageUrl();
	if (!appId) return;

	const container = injectLootScoutContainer();
	if (!container) return;

	try {
		const response = (await browser.runtime.sendMessage({
			action: 'getAppData',
			appId,
		})) as GameDataResponse;

		debug.log('API Response:', response);

		if (response.success) {
			const currentCountry = await browser.runtime.sendMessage({
				action: 'getCountryCode',
			});

			await updateContainerState(container, {
				status: 'success',
				gameData: response.data,
				countryCode: currentCountry,
			});
		} else {
			await updateContainerState(container, {
				status: 'error',
				error: response.data as ApiError,
			});
		}
	} catch (error) {
		await updateContainerState(container, {
			status: 'error',
			error: {
				name: 'CommunicationError',
				message: 'Failed to communicate with extension background',
				code: 0,
				status: 0,
			},
		});

		console.error('LootScout: Error communicating with background script:', error);
	}
}

// Entry Point
if (window.location.href.includes('store.steampowered.com/app/')) {
	initializeContentScript();
}
