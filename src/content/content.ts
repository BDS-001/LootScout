import browser from 'webextension-polyfill';
import parseSteamPageUrl from './parsers/SteamParser';
import { injectLootScoutContainer, updateContainerState } from './ui/LootScoutContainer';
import { GameDataResponse, ApiError } from '../lib/shared/types';
import injectCSS from './injectCSS';
import { debug } from '../lib/utils/debug';

async function initializeContentScript(): Promise<void> {
	debug.log('Content script bootstrap');

	injectCSS();

	const { appId } = parseSteamPageUrl();
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

		const response = (await browser.runtime.sendMessage({
			action: 'getAppData',
			appId,
		})) as GameDataResponse;

		debug.log('API Response:', response);

		if (response.success) {
			let currentCountry: string | undefined;
			try {
				currentCountry = await browser.runtime.sendMessage({
					action: 'getCountryCode',
				});
			} catch (error) {
				debug.warn('Failed to get country code:', error);
			}

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

		debug.error('Error communicating with background script:', error);
	}
}

// Entry Point
if (window.location.href.includes('store.steampowered.com/app/')) {
	initializeContentScript();
}
