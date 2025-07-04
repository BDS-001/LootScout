import browser from 'webextension-polyfill';
import parseSteamPageUrl from './util/steamAppIdParser';
import { GameDataApiResponse } from './shared/types';
import contentCss from './styles/content.css?inline';

function injectCSS(): void {
	const style = document.createElement('style');
	style.textContent = contentCss;
	document.head.appendChild(style);
}

function createDealBladeContent(): void {
	const purchaseSection = document.getElementById('game_area_purchase');
	const packageGroup = purchaseSection?.querySelector('.package_group');

	const contentDiv = document.createElement('div');
	contentDiv.className = 'deal_blade';

	const wrapper = document.createElement('div');
	wrapper.className = 'content-wrapper';

	const priceGrid = document.createElement('div');
	priceGrid.className = 'price-grid';

	const currentLabel = document.createElement('span');
	currentLabel.innerText = 'Current Best:';
	const currentPrice = document.createElement('span');
	currentPrice.innerText = '$29.99';

	const historicalLabel = document.createElement('span');
	historicalLabel.innerText = 'Historical Low:';
	const historicalPrice = document.createElement('span');
	historicalPrice.innerText = '$19.99';

	priceGrid.appendChild(currentLabel);
	priceGrid.appendChild(currentPrice);
	priceGrid.appendChild(historicalLabel);
	priceGrid.appendChild(historicalPrice);

	const detailsLink = document.createElement('a');
	detailsLink.href = '#';
	detailsLink.innerText = 'View pricing details (gg.deals)';

	wrapper.appendChild(priceGrid);
	wrapper.appendChild(detailsLink);
	contentDiv.appendChild(wrapper);

	const ref: Node | null = packageGroup?.nextSibling ?? null;
	purchaseSection?.insertBefore(contentDiv, ref);
}

async function initializeContentScript(): Promise<void> {
	injectCSS();

	const { appId } = parseSteamPageUrl();
	const apiKey = import.meta.env.VITE_GG_API_KEY; //temp env variable implementation
	if (false) {
		const response: GameDataApiResponse = await browser.runtime.sendMessage({
			action: 'getAppData',
			appId,
			apiKey,
			region: 'ca',
		});
		console.log(response);
	}

	createDealBladeContent();
}

// Entry Point
if (window.location.href.includes('store.steampowered.com/app/')) {
	initializeContentScript();
}
