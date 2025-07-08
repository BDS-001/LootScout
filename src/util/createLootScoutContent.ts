import { GgDealsApiResponse } from '../shared/types';

export default function createLootScoutContent(response: GgDealsApiResponse, appId: string): void {
	const purchaseSection = document.getElementById('game_area_purchase');
	if (!purchaseSection) {
		console.error('Purchase section not found on Steam page');
		return;
	}

	const packageGroup = purchaseSection.querySelector('.package_group');
	if (!packageGroup) {
		console.error('Package group not found in purchase section');
		return;
	}

	// Check if response is successful
	if (!response.success) {
		console.error('API response was not successful:', response.data);
		return;
	}

	// Get game data using appId as key
	const gameData = response.data[appId];
	if (!gameData) {
		console.error('Game data not found for appId:', appId);
		return;
	}

	const prices = gameData.prices;

	const contentDiv = document.createElement('div');
	contentDiv.className = 'loot_scout';
	contentDiv.innerHTML = `
		<div class="title_container">
			<h3 class="loot_scout_title">LootScout | ${gameData.title}</h3>
			<a href="${gameData.url}">View Pricing Details</a>
		</div>
		<div class="price_grid">
			<span>Current Best:</span>
			<span>${(prices.currentRetail / 100).toFixed(2)} ${prices.currency}</span>
			<span>Historical Low:</span>
			<span>${(prices.historicalRetail / 100).toFixed(2)} ${prices.currency}</span>
		</div>
		<span class="powered_by">Powered by <a href="https://gg.deals/" target="_blank">GG.deals</a></span>
	`;

	const ref: Node | null = packageGroup.nextSibling ?? null;
	purchaseSection.insertBefore(contentDiv, ref);
}
