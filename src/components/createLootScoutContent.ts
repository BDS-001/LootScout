import { GameData } from '../shared/types';
import { formatPrice } from '../utils/priceCalculations';
import { createRarityComponent } from './RarityComponent';

// Function to inject content into .rightcol
export function createLootScoutContentRightCol(gameData: GameData): void {
	const rightCol = document.querySelector('.rightcol.game_meta_data');
	if (!rightCol) {
		console.error('LootScout: .rightcol.game_meta_data element not found on Steam page');
		return;
	}

	// get the precompiled data
	const { lootScout } = gameData;

	const headerDiv = document.createElement('div');
	headerDiv.className = 'block responsive_apppage_details_right heading';
	headerDiv.textContent = `LootScout | ${gameData.title}`;

	const contentDiv = document.createElement('div');
	contentDiv.className = 'block responsive_apppage_details_right recommendation_noinfo';
	contentDiv.innerHTML = `
		<div class="deal_section">
			<div class="deal_header">Steam Current Discount Rating</div>
			<div class="deal_rating">
				<span class="rating_label">Rating:</span>
				${createRarityComponent(gameData.steam.discount_percent, false)}
			</div>
			<div class="deal_status">
				<span class="${lootScout.steam.status.className}">${lootScout.steam.status.text}</span>
			</div>
		</div>
		
		<div class="deal_section">
			<div class="deal_header">Current Best Deal</div>
			<div class="deal_price">${formatPrice(gameData.deal.currentBest, gameData.deal.currency)} <span class="raw_discount">(${lootScout.currentBest.rawDiscount}% off)</span></div>
			<div class="deal_discount"><span class="highlight_green">${lootScout.currentBest.discount}%</span> off Steam</div>
			<div class="deal_comparison">
				${
					lootScout.currentBest.isEqualToSteam
						? '<span class="steam_equal">Equal to Steam</span>'
						: `<span class="deal_text">Save extra <span class="highlight_green">${formatPrice(Math.abs(lootScout.currentBest.savings), gameData.deal.currency)}</span></span>`
				}
			</div>
			<div class="deal_button">
				<a href="${gameData.deal.url}" target="_blank" class="btnv6_blue_hoverfade btn_medium"><span>View Deals</span></a>
			</div>
			${createRarityComponent(lootScout.currentBest.rawDiscount, true)}
		</div>
		
		<div class="deal_section">
			<div class="deal_header">Historical Low</div>
			<div class="deal_price">${formatPrice(gameData.deal.historicalBest, gameData.deal.currency)} <span class="raw_discount">(${lootScout.historicalBest.rawDiscount}% off)</span></div>
			<div class="deal_discount"><span class="highlight_green">${lootScout.historicalBest.discount}%</span> off Steam</div>
			<div class="deal_comparison">
				${
					lootScout.historicalBest.isEqualToSteam
						? '<span class="steam_equal">Equal to Steam</span>'
						: `<span class="deal_text">Save extra <span class="highlight_green">${formatPrice(Math.abs(lootScout.historicalBest.savings), gameData.deal.currency)}</span></span>`
				}
			</div>
			<div class="deal_button">
				<a href="${gameData.deal.url}" target="_blank" class="btnv6_blue_hoverfade btn_medium"><span>View Deals</span></a>
			</div>
			${createRarityComponent(lootScout.historicalBest.rawDiscount, true)}
		</div>
		
		<div class="deal_section">
			<div class="deal_header">Additional Resources</div>
			<div class="additional_resources">
				<a href="${lootScout.hltb.url}" target="_blank" class="linkbar">
					<span>How Long to Beat</span>
				</a>
			</div>
		</div>
		
		<div class="loot_scout_footer">
			<span class="powered_by">Powered by&nbsp;<a href="https://gg.deals/" target="_blank">GG.deals</a></span>
		</div>
	`;

	rightCol.insertBefore(headerDiv, rightCol.firstChild);
	rightCol.insertBefore(contentDiv, headerDiv.nextSibling);
}
