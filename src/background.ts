import browser from 'webextension-polyfill';
import fetchCombinedGameData from './api/combinedGameData';
import { normalizeResponse } from './helpers/formatResponse';
import { CombinedGameDataParams } from './shared/types';

console.log('Hello from the background!');

browser.runtime.onInstalled.addListener((details) => {
	console.log('Extension installed:', details);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.action === 'getAppData') {
		const params: CombinedGameDataParams = {
			appId: msg.appId,
			apiKey: msg.apiKey,
			region: msg.region,
		};

		fetchCombinedGameData(params).then((res) => {
			console.log('Raw combined data response:', res);
			const normalizedRes = normalizeResponse(res);
			console.log('Normalized response:', normalizedRes);
			sendResponse(normalizedRes);
		});

		// return true to indicate we’ll call sendResponse asynchronously
		return true;
	}
});
