import { NormalizedCombinedGameData, SteamPriceOverview } from '../shared/types';
import { calculatePriceComparison, formatPrice } from '../utils/priceCalculations';
import { createRarityComponent } from './RarityComponent';

function getSteamPrice(priceOverview: SteamPriceOverview | undefined): number {
	if (!priceOverview) {
		return 0;
	}

	return priceOverview.final || 0;
}

function getSteamOriginalPrice(priceOverview: SteamPriceOverview | undefined): number {
	if (!priceOverview) {
		return 0;
	}

	return priceOverview.initial || priceOverview.final || 0;
}

// Function to inject content into .rightcol
export function createLootScoutContentRightCol(combinedData: NormalizedCombinedGameData): void {
	const { ggDealsData, steamStoreData } = combinedData;

	const rightCol = document.querySelector('.rightcol.game_meta_data');
	if (!rightCol) {
		console.error('LootScout: .rightcol.game_meta_data element not found on Steam page');
		return;
	}

	if (!ggDealsData.success || !ggDealsData.data) {
		console.error('Invalid GG Deals data');
		return;
	}

	const gameData = ggDealsData.data;
	const steamPrice =
		steamStoreData.success && steamStoreData.data?.success
			? getSteamPrice(steamStoreData.data.data?.price_overview)
			: 0;

	const steamOriginalPrice =
		steamStoreData.success && steamStoreData.data?.success
			? getSteamOriginalPrice(steamStoreData.data.data?.price_overview)
			: steamPrice;

	const priceComparison = calculatePriceComparison(
		steamPrice,
		steamOriginalPrice,
		gameData.prices.currentRetail,
		gameData.prices.historicalRetail
	);

	const headerDiv = document.createElement('div');
	headerDiv.className = 'block responsive_apppage_details_right heading responsive_hidden';
	headerDiv.textContent = `LootScout | ${gameData.title}`;

	const contentDiv = document.createElement('div');
	contentDiv.className =
		'block responsive_apppage_details_right recommendation_noinfo responsive_hidden';
	contentDiv.innerHTML = `
		<div class="deal_section">
			<div class="deal_header">Current Best Deal</div>
			<div class="deal_price">${formatPrice(gameData.prices.currentRetail, gameData.prices.currency)} <span class="raw_discount">(${priceComparison.currentRawDiscount}% off)</span></div>
			<div class="deal_discount">${priceComparison.currentDiscount}% off Steam</div>
			<div class="deal_comparison">
				${
					priceComparison.steamEqualsCurrent
						? '<span class="steam_equal">Equal to Steam</span>'
						: `<span class="steam_save">Save extra ${Math.abs(priceComparison.currentSavings).toFixed(2)} ${gameData.prices.currency}</span>`
				}
			</div>
			<div class="deal_button">
				<a href="${gameData.url}" target="_blank" class="btnv6_blue_hoverfade btn_medium"><span>View Deals</span></a>
			</div>
			${createRarityComponent(priceComparison.currentRawDiscount)}
		</div>
		
		<div class="deal_section">
			<div class="deal_header">Historical Low</div>
			<div class="deal_price">${formatPrice(gameData.prices.historicalRetail, gameData.prices.currency)} <span class="raw_discount">(${priceComparison.historicalRawDiscount}% off)</span></div>
			<div class="deal_discount">${priceComparison.historicalDiscount}% off Steam</div>
			<div class="deal_comparison">
				${
					priceComparison.steamEqualsHistorical
						? '<span class="steam_equal">Equal to Steam</span>'
						: `<span class="steam_save">Save extra ${Math.abs(priceComparison.historicalSavings).toFixed(2)} ${gameData.prices.currency}</span>`
				}
			</div>
			<div class="deal_button">
				<a href="${gameData.url}" target="_blank" class="btnv6_blue_hoverfade btn_medium"><span>View Deals</span></a>
			</div>
			${createRarityComponent(priceComparison.historicalRawDiscount)}
		</div>
		
		<div class="loot_scout_footer">
			<span class="powered_by">Powered by <a href="https://gg.deals/" target="_blank">GG.deals</a></span>
		</div>
	`;

	rightCol.insertBefore(headerDiv, rightCol.firstChild);
	rightCol.insertBefore(contentDiv, headerDiv.nextSibling);
}
