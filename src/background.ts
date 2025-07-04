import browser from 'webextension-polyfill';
import fetchGameData from './api/ggDealsApi';

console.log('Hello from the background!');

browser.runtime.onInstalled.addListener((details) => {
	console.log('Extension installed:', details);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.action === 'getAppData') {
		const url =
			`https://api.gg.deals/v1/prices/by-steam-app-id/` +
			`?ids=${msg.appId}` +
			`&key=${msg.apiKey}` +
			`&region=${msg.region}`;

		sendResponse(fetchGameData(url));

		// return true to indicate we’ll call sendResponse asynchronously
		return true;
	}
});
