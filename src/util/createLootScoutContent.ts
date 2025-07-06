import { GameDataApiResponse, GameInfo } from '../shared/types';

export default function createLootScoutContent(
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
	//contentDiv.appendChild(generateRarityTestDiv());
	contentDiv.appendChild(poweredBy);

	const ref: Node | null = packageGroup?.nextSibling ?? null;
	purchaseSection?.insertBefore(contentDiv, ref);
}