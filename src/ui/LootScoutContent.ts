import { GameData, ApiError } from '../shared/types';
import { formatPrice } from '../utils/PriceUtils';
import { createRarityComponent } from './RarityComponent';
import regionMap from '../constants/regionMap';

// Loading state content
export function createLoadingContent(): string {
	return `
		<div class="deal_section">
			<div class="deal_header">🔍 Scouting for deals...</div>
			<div class="deal_status">Running expedition to find the best prices</div>
		</div>
	`;
}

// Error state content
export function createErrorContent(error?: ApiError): string {
	const errorMessage = error?.message || 'Unknown error occurred';
	const errorDetails = getErrorDetails(error);

	return `
		<div class="deal_section">
			<div class="deal_header">❌ Expedition Failed</div>
			<div class="deal_status error">Unable to scout for deals</div>
			<div class="error_message">${errorMessage}</div>
			${errorDetails ? `<div class="error_details">${errorDetails}</div>` : ''}
			<div class="deal_button">
				<button class="btnv6_blue_hoverfade btn_medium" onclick="window.location.reload()">
					<span>Try Again</span>
				</button>
			</div>
		</div>
	`;
}

function formatRegionDisplay(countryCode: string): string {
	const countryInfo = regionMap[countryCode as keyof typeof regionMap];
	return countryInfo ? `${countryInfo.name} (${countryInfo.currency})` : countryCode.toUpperCase();
}

function createRegionInfo(countryCode?: string): string {
	return countryCode
		? `<span class="footer_info">Region: ${formatRegionDisplay(countryCode)}</span>`
		: '';
}

// Success state content
export function createSuccessContent(gameData: GameData, countryCode?: string): string {
	const { lootScout } = gameData;

	return `
		
		<div class="deal_section">
			<div class="deal_header">Steam Discount Rating</div>
			<div class="deal_price">${formatPrice(gameData.steam.final, gameData.steam.currency)} <span class="raw_discount">(${gameData.steam.discount_percent}% off)</span></div>
			<div class="deal_status">
				<span class="${lootScout.steam.status.className}">${lootScout.steam.status.text}</span>
			</div>
			${createRarityComponent(gameData.steam.discount_percent, true)}
		</div>
		
		<div class="deal_section">
			<div class="deal_header">Current Best Deal</div>
			<div class="deal_price">${formatPrice(gameData.deal.currentBest, gameData.deal.currency)} <span class="raw_discount">(${lootScout.currentBest.rawDiscount}% off)</span></div>
			<div class="deal_discount"><span class="highlight_green">${lootScout.currentBest.discount}%</span> off Steam</div>
			<div class="deal_comparison">
				${
					gameData.steam.final === gameData.deal.currentBest
						? '<span class="steam_comparison">Equal to Steam</span>'
						: lootScout.currentBest.savings < 0
							? '<span class="steam_comparison">Worse than Steam</span>'
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
					gameData.steam.final === gameData.deal.historicalBest
						? '<span class="steam_comparison">Equal to Steam</span>'
						: lootScout.historicalBest.savings < 0
							? '<span class="steam_comparison">Worse than Steam</span>'
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
			<span class="footer_info">Powered by&nbsp;<a href="https://gg.deals/" target="_blank">GG.deals</a></span>
			${createRegionInfo(countryCode)}
		</div>
	`;
}

// Helper function for error details
function getErrorDetails(error?: ApiError): string | null {
	if (!error) return null;

	switch (error.code) {
		case 429:
			return 'Rate limit exceeded. Please try again in a few minutes.';
		case 404:
			return 'Game not found in our database.';
		case 500:
			return 'Server error. Our team has been notified.';
		case 401:
			return 'Authentication failed. Please check extension settings.';
		default:
			return error.code ? `Error code: ${error.code}` : null;
	}
}
