import browser from 'webextension-polyfill';
import parseSteamPageUrl from './util/steamAppIdParser';
import generateRarityTestDiv from './util/testRarityColors';
import getGameBasePrice from './util/getGameBasePrice';
import createLootScoutContent from './util/createLootScoutContent';
import { GameDataApiResponse, GameInfo } from './shared/types';
import contentCss from './styles/content.css?inline';
import raritiesCss from './styles/rarities.css?inline';

function injectCSS(): void {
	const style = document.createElement('style');
	style.textContent = contentCss;
	document.head.appendChild(style);

	const raritiesStyle = document.createElement('style');
	raritiesStyle.textContent = raritiesCss;
	document.head.appendChild(raritiesStyle);
}


async function initializeContentScript(): Promise<void> {
	injectCSS();

	const { appId } = parseSteamPageUrl();
	if (!appId) return;

	// Log the game base price before setting up HTML injection
	getGameBasePrice();

	// Test data from example.json
	const testResponse: GameDataApiResponse = {
		success: true,
		data: {
			'2290180': {
				title: 'Riders Republic',
				url: 'https://gg.deals/game/riders-republic/',
				prices: {
					currentRetail: '4.99',
					currentKeyshops: '10.40',
					historicalRetail: '4.99',
					historicalKeyshops: '10.40',
					currency: 'CAD',
				},
			},
		},
	};

	// Use test data with actual appId or fallback to test appId
	const testAppId = '2290180';

	if (false) {
		const apiKey = import.meta.env.VITE_GG_API_KEY; //temp env variable implementation
		const response: GameDataApiResponse = await browser.runtime.sendMessage({
			action: 'getAppData',
			appId,
			apiKey,
			region: 'ca',
		});
		console.log(response);

		if (response.success) {
			//createLootScoutContent(response, appId);
		}
	}

	createLootScoutContent(testResponse, testAppId);
}

// Entry Point
if (window.location.href.includes('store.steampowered.com/app/')) {
	initializeContentScript();
}
