import { ProcessedGameData, ApiError } from '../shared/types';
import { formatPrice } from '../utils/PriceUtils';
import { createRarityComponent } from './RarityComponent';
import { getYouTubeUrl } from '../helpers/youtube';
import { getHltbUrl } from '../helpers/hltb';

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

function createFooter(): string {
	return `<div class="loot_scout_footer"><span class="footer_info">Powered by&nbsp;<a href="https://gg.deals/" target="_blank">GG.deals</a>&nbsp;and&nbsp;<a href="https://store.steampowered.com/" target="_blank">Steam</a>.<br>Not affiliated with GG.deals or Valve Corporation.</span></div>`;
}

function createSimpleFooter(): string {
	return `<div class="loot_scout_footer"><span class="footer_info">Powered by&nbsp;<a href="https://store.steampowered.com/" target="_blank">Steam</a>.<br>Not affiliated with Valve Corporation.</span></div>`;
}

interface DealSectionData {
	header: string;
	price: number;
	currency: string;
	discount: number;
	status?: any;
	costPerHour?: number;
	comparison?: string;
	rarity: string;
}

function createDealSection(data: DealSectionData): string {
	const valueMetric = data.costPerHour ? createValueMetric(data.costPerHour, data.currency) : '';
	const statusDiv = data.status
		? `<div class="deal_status"><span class="${data.status.className}">${data.status.text}</span></div>`
		: '';
	return `<div class="deal_section"><div class="deal_header">${data.header}</div><div class="price_container"><div class="deal_price">${formatPrice(data.price, data.currency)} <span class="raw_discount">(${data.discount}% off)</span></div>${valueMetric}</div>${statusDiv}${data.comparison || ''}${data.rarity}</div>`;
}

function createComparisonText(
	steamPrice: number,
	dealPrice: number,
	savings: number,
	currency: string,
	discount: number,
	url: string
): string {
	const comparisonText =
		steamPrice === dealPrice
			? '<span class="steam_comparison">Equal to Steam</span>'
			: savings < 0
				? '<span class="steam_comparison">Worse than Steam</span>'
				: `<span class="deal_text">Save extra <span class="highlight_green">${formatPrice(Math.abs(savings), currency)}</span></span>`;
	return `<div class="deal_discount"><span class="highlight_green">${discount}%</span> off Steam</div><div class="deal_comparison">${comparisonText}</div><div class="deal_button"><a href="${url}" target="_blank" class="btnv6_blue_hoverfade btn_medium"><span>View Deals</span></a></div>`;
}

function createValueMetric(costValue: number, currency: string): string {
	return `<div class="value_metric">${formatPrice(costValue, currency)} per hour</div>`;
}

function createResourcesSection(gameTitle: string): string {
	const hltbUrl = getHltbUrl(gameTitle);
	const youtubeUrl = getYouTubeUrl(gameTitle);
	return `
		<div class="deal_section">
			<div class="deal_header">Additional Resources</div>
			<div class="additional_resources">
				<a href="${hltbUrl}" target="_blank" class="linkbar">
					<span>How Long to Beat</span>
				</a>
				<a href="${youtubeUrl}" target="_blank" class="linkbar">
					<span>YouTube</span>
				</a>
			</div>
		</div>
	`;
}

function createSpecialGameContent(
	header: string,
	statusText: string,
	statusClass: string,
	gameTitle: string
): string {
	return `
		<div class="deal_section">
			<div class="deal_header">${header}</div>
			<div class="deal_status">
				<span class="${statusClass}">${statusText}</span>
			</div>
		</div>
		${createResourcesSection(gameTitle)}
		${createSimpleFooter()}
	`;
}

// Free game content
export function createFreeGameContent(gameData: ProcessedGameData): string {
	return createSpecialGameContent(
		'🎮 Free to Play',
		'This game is free to play',
		gameData.lootScout.steam.status.className,
		gameData.title
	);
}

// Coming soon game content
export function createComingSoonContent(gameData: ProcessedGameData): string {
	return createSpecialGameContent(
		'📅 Coming Soon',
		gameData.lootScout.steam.status.text,
		gameData.lootScout.steam.status.className,
		gameData.title
	);
}

// Success state content
export async function createSuccessContent(gameData: ProcessedGameData): Promise<string> {
	const { lootScout } = gameData;

	// Handle special cases
	if (!gameData.deal || !lootScout.currentBest || !lootScout.historicalBest) {
		if (lootScout.steam.status.className === 'steam_free_game') {
			return createFreeGameContent(gameData);
		}
		if (lootScout.steam.status.className === 'steam_coming_soon') {
			return createComingSoonContent(gameData);
		}
	}

	// Create rarity components
	const rarities = await Promise.all([
		createRarityComponent(
			gameData.steam.discount_percent,
			gameData.steam.reviewScore,
			gameData.steam.averagePlaytime,
			gameData.steam.reviewSummary
		),
		createRarityComponent(
			lootScout.currentBest!.rawDiscount,
			gameData.steam.reviewScore,
			gameData.steam.averagePlaytime,
			gameData.steam.reviewSummary
		),
		createRarityComponent(
			lootScout.historicalBest!.rawDiscount,
			gameData.steam.reviewScore,
			gameData.steam.averagePlaytime,
			gameData.steam.reviewSummary
		),
	]);

	// Create deal sections
	const steamSection = createDealSection({
		header: 'Steam Discount Rating',
		price: gameData.steam.final,
		currency: gameData.steam.currency,
		discount: gameData.steam.discount_percent,
		status: lootScout.steam.status,
		costPerHour: lootScout.costPerHour?.steam,
		rarity: rarities[0],
	});

	const currentSection = createDealSection({
		header: 'Current Best Deal',
		price: gameData.deal!.currentBest,
		currency: gameData.deal!.currency,
		discount: lootScout.currentBest!.rawDiscount,
		costPerHour: lootScout.costPerHour?.currentBest,
		comparison: createComparisonText(
			gameData.steam.final,
			gameData.deal!.currentBest,
			lootScout.currentBest!.savings,
			gameData.deal!.currency,
			lootScout.currentBest!.discount,
			gameData.deal!.url
		),
		rarity: rarities[1],
	});

	const historicalSection = createDealSection({
		header: 'Historical Low',
		price: gameData.deal!.historicalBest,
		currency: gameData.deal!.currency,
		discount: lootScout.historicalBest!.rawDiscount,
		costPerHour: lootScout.costPerHour?.historicalBest,
		comparison: createComparisonText(
			gameData.steam.final,
			gameData.deal!.historicalBest,
			lootScout.historicalBest!.savings,
			gameData.deal!.currency,
			lootScout.historicalBest!.discount,
			gameData.deal!.url
		),
		rarity: rarities[2],
	});

	return (
		steamSection +
		currentSection +
		historicalSection +
		createResourcesSection(gameData.title) +
		createFooter()
	);
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
