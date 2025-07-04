import browser from 'webextension-polyfill';
import parseSteamPageUrl from './util/steamAppIdParser';
import { GameDataApiResponse } from './shared/types';

async function handleContentProcesing(): Promise<void> {
	const { appId } = parseSteamPageUrl();
	const apiKey = import.meta.env.VITE_GG_API_KEY; //temp env variable implementation
	const response: GameDataApiResponse = await browser.runtime.sendMessage({
		action: 'getAppData',
		appId,
		apiKey,
		region: 'ca',
	});
	console.log(response);
}

// Entry Point
if (window.location.href.includes('store.steampowered.com/app/')) {
	handleContentProcesing();
}
