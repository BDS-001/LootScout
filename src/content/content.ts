import browser from 'webextension-polyfill';
import parseSteamPageUrl from './parsers/SteamParser';
import { injectLootScoutContainer, updateContainerState } from './ui/LootScoutContainer';
import { isGameDataResponse } from '../lib/shared/types';
import injectCSS from './injectCSS';
import { debug } from '../lib/utils/debug';

async function initializeContentScript(): Promise<void> {
	debug.log('Content script bootstrap');

	injectCSS();

	const { appId, appName } = parseSteamPageUrl();
	if (!appId) {
		debug.log('No appId detected, aborting');
		return;
	}

	debug.log('Detected appId', appId);

	const container = injectLootScoutContainer();
	if (!container) {
		debug.warn('Failed to inject LootScout container');
		return;
	}

	try {
		await updateContainerState(container, { status: 'loading' });

		const rawResponse = await browser.runtime.sendMessage({
			action: 'getAppData',
			appId,
		});

		if (!isGameDataResponse(rawResponse)) {
			throw new Error('Received malformed response from extension background');
		}

		debug.log('API Response:', rawResponse);

		if (rawResponse.success) {
			let currentCountry: string | undefined;
			try {
				const countryResponse = await browser.runtime.sendMessage({
					action: 'getCountryCode',
				});
				currentCountry = typeof countryResponse === 'string' ? countryResponse : undefined;
			} catch (error) {
				debug.warn('Failed to get country code:', error);
			}

			await updateContainerState(container, {
				status: 'success',
				gameData: rawResponse.data,
				countryCode: currentCountry,
			});
		} else {
			await updateContainerState(container, {
				status: 'error',
				error: rawResponse.data,
				appId,
				gameTitle: appName || undefined,
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
			appId,
			gameTitle: appName || undefined,
		});

		debug.error('Error communicating with background script:', error);
	}
}

// Entry Point
if (window.location.href.includes('store.steampowered.com/app/')) {
	initializeContentScript();
}
