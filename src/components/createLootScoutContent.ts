import { NormalizedCombinedGameData } from '../shared/types';
import calculateDiscount from '../util/calculateDiscount';

export default function createLootScoutContent(combinedData: NormalizedCombinedGameData): void {
	const { ggDealsData, steamStoreData } = combinedData;

	// Validate DOM elements
	const purchaseSection = document.getElementById('game_area_purchase');
	const packageGroup = purchaseSection?.querySelector('.package_group');
	if (!purchaseSection || !packageGroup) {
		console.error('Required DOM elements not found on Steam page');
		return;
	}

	// Validate ggdeals data (required)
	if (!ggDealsData.success || !ggDealsData.data) {
		console.error('Invalid GG Deals data');
		return;
	}

	// Get data (much cleaner with normalized structure)
	const gameData = ggDealsData.data;
	const steamPrice = steamStoreData.success && steamStoreData.data?.success
		? steamStoreData.data.data?.price_overview?.initial || steamStoreData.data.data?.price_overview?.final || 0
		: 0;

	// Calculate discounts
	const currentDiscount = calculateDiscount(steamPrice, gameData.prices.currentRetail);
	const historicalDiscount = calculateDiscount(steamPrice, gameData.prices.historicalRetail);

	// Create and inject content
	const contentDiv = document.createElement('div');
	contentDiv.className = 'loot_scout';
	contentDiv.innerHTML = `
		<div class="title_container">
			<h3 class="loot_scout_title">LootScout | ${gameData.title}</h3>
			<a href="${gameData.url}">View Pricing Details</a>
		</div>
		<div class="price_grid">
			<span>Current Best:</span>
			<span>${(gameData.prices.currentRetail / 100).toFixed(2)} ${gameData.prices.currency} | ${currentDiscount}% off</span>
			<span>Historical Low:</span>
			<span>${(gameData.prices.historicalRetail / 100).toFixed(2)} ${gameData.prices.currency} | ${historicalDiscount}% off</span>
		</div>
		<span class="powered_by">Powered by <a href="https://gg.deals/" target="_blank">GG.deals</a></span>
	`;

	purchaseSection.insertBefore(contentDiv, packageGroup.nextSibling);
}
