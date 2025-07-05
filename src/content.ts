import browser from 'webextension-polyfill';
import parseSteamPageUrl from './util/steamAppIdParser';
import generateRarityTestDiv from './util/testRarityColors';
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

function createLootScoutContent(
	response: { success: true; data: Record<string, GameInfo | null> },
	appId: string
): void {
	const purchaseSection = document.getElementById('game_area_purchase');
	const packageGroup = purchaseSection?.querySelector('.package_group');

	const contentDiv = document.createElement('div');
	contentDiv.className = 'loot_scout';

	// Get game data using appId as key
	const gameData = response.data[appId];
	if (!gameData) return;

	const prices = gameData.prices;

	const titleContainer = document.createElement('div');
	titleContainer.className = 'title_container';

	const title = document.createElement('h3');
	title.className = 'loot_scout_title';
	title.innerText = `LootScout | ${gameData.title}`;

	const detailsLink = document.createElement('a');
	detailsLink.href = gameData.url;
	detailsLink.innerText = 'View Pricing Details';

	titleContainer.appendChild(title);
	titleContainer.appendChild(detailsLink);

	const priceGrid = document.createElement('div');
	priceGrid.className = 'price_grid';

	const currentLabel = document.createElement('span');
	currentLabel.innerText = 'Current Best:';
	const currentPrice = document.createElement('span');
	currentPrice.innerText = `${prices.currentRetail} ${prices.currency}`;

	const historicalLabel = document.createElement('span');
	historicalLabel.innerText = 'Historical Low:';
	const historicalPrice = document.createElement('span');
	historicalPrice.innerText = `${prices.historicalRetail} ${prices.currency}`;

	priceGrid.appendChild(currentLabel);
	priceGrid.appendChild(currentPrice);
	priceGrid.appendChild(historicalLabel);
	priceGrid.appendChild(historicalPrice);

	const poweredBy = document.createElement('span');
	poweredBy.className = 'powered_by';
	poweredBy.innerHTML = 'Powered by <a href="https://gg.deals/" target="_blank">GG.deals</a>';

	contentDiv.appendChild(titleContainer);
	contentDiv.appendChild(priceGrid);
	contentDiv.appendChild(generateRarityTestDiv());
	contentDiv.appendChild(poweredBy);

	const ref: Node | null = packageGroup?.nextSibling ?? null;
	purchaseSection?.insertBefore(contentDiv, ref);
}

async function initializeContentScript(): Promise<void> {
	injectCSS();

	const { appId } = parseSteamPageUrl();
	if (!appId) return;

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
