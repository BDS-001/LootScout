import browser from 'webextension-polyfill';
import fetchCombinedGameData from './api/combinedGameData';
import {
	CombinedGameDataParams,
	CombinedGameDataResponse,
	NormalizedCombinedGameDataResponse,
} from './shared/types';

console.log('Hello from the background!');

function normalizeResponse(
	response: CombinedGameDataResponse,
	appId: string
): NormalizedCombinedGameDataResponse {
	if (!response.success) {
		return response;
	}

	return {
		success: true,
		data: {
			appId: response.data.appId,
			ggDealsData: response.data.ggDealsData.success
				? { success: true, data: response.data.ggDealsData.data[appId] || null }
				: response.data.ggDealsData,
			steamStoreData: response.data.steamStoreData.success
				? { success: true, data: response.data.steamStoreData.data[appId] || null }
				: response.data.steamStoreData,
		},
	};
}

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
			const normalizedRes = normalizeResponse(res, params.appId);
			sendResponse(normalizedRes);
		});

		// return true to indicate we’ll call sendResponse asynchronously
		return true;
	}
});
