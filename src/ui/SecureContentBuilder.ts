import { ProcessedGameData, ApiError } from '../shared/types';
import { formatPrice } from '../utils/PriceUtils';
import { createRarityComponent } from './RarityComponent';
import { getYouTubeUrl } from '../utils/youtube';
import { getHltbUrl } from '../utils/hltb';
import { getSteamDbUrl } from '../utils/steamDb';
import { dom, setText, addChild, onClick, setAttribute } from '../utils/DomBuilder';
import { createStandardFooter, createSimpleFooter, getErrorDetails } from './ContentHelpers';
import { isRecentlyReleased } from '../utils/gameAge';
import { STEAM_PERMISSION_INSTRUCTIONS } from '../constants/messages';

const DEFAULT_ERROR_MESSAGE =
	'There was an error getting the pricing information. Please try again in a few minutes.';

function getUserFriendlyError(error?: ApiError): string {
	if (!error) return DEFAULT_ERROR_MESSAGE;

	if (error.code === 429) {
		return 'Rate limit reached. Add your own GG.deals API key in the extension settings to avoid this, or try again in a few minutes.';
	}

	if (error.name === 'MissingSteamPermission') {
		return STEAM_PERMISSION_INSTRUCTIONS;
	}

	if (error.name?.includes('GG.deals') && !error.code) {
		return 'Unable to connect to pricing service. Adding your own GG.deals API key may help avoid connection issues.';
	}

	return error.message || DEFAULT_ERROR_MESSAGE;
}

function createMissingPermissionContent(): HTMLElement {
	const section = addChild(
		dom.div('deal_section'),
		setText(dom.div('deal_header'), 'Permission Required'),
		setText(dom.div('deal_status'), 'LootScout needs access to store.steampowered.com.'),
		setText(dom.div('error_message'), STEAM_PERMISSION_INSTRUCTIONS),
		setText(
			dom.div('error_details'),
			'Open the LootScout toolbar icon and choose Always allow on store.steampowered.com.'
		)
	);

	return section;
}

export function createLoadingContent(): HTMLElement {
	const loadingText = addChild(
		dom.span(),
		'🔍 Scouting for deals',
		setText(dom.span('load'), '...')
	);

	return addChild(
		dom.div('deal_section'),
		addChild(dom.div('deal_header'), loadingText),
		setText(dom.div('deal_status'), 'Running expedition to find the best prices')
	);
}

export function createErrorContent(error?: ApiError): HTMLElement {
	if (error?.name === 'MissingSteamPermission') {
		return createMissingPermissionContent();
	}

	const userFriendlyMessage = getUserFriendlyError(error);

	const errorDetails = getErrorDetails(error);

	const section = addChild(
		dom.div('deal_section'),
		setText(dom.div('deal_header'), '❌ Expedition Failed'),
		setText(dom.div('deal_status error'), 'Unable to scout for deals'),
		setText(dom.div('error_message'), userFriendlyMessage)
	);

	if (errorDetails) {
		addChild(section, setText(dom.div('error_details'), errorDetails));
	}

	const button = onClick(
		addChild(dom.button('btnv6_blue_hoverfade btn_medium'), setText(dom.span(), 'Try Again')),
		() => window.location.reload()
	);

	return addChild(section, addChild(dom.div('deal_button'), button));
}

function createDealSection(
	header: string,
	price: number,
	currency: string,
	discount: number,
	costPerHour?: number,
	comparison?: HTMLElement,
	rarity?: HTMLElement
): HTMLElement {
	const section = addChild(dom.div('deal_section'), setText(dom.div('deal_header'), header));

	const priceText = `${formatPrice(price, currency)} `;
	const discountText = `(${discount}% off)`;

	const priceContainer = addChild(
		dom.div('price_container'),
		addChild(dom.div('deal_price'), priceText, setText(dom.span('raw_discount'), discountText))
	);

	if (costPerHour) {
		const valueText = `${formatPrice(costPerHour, currency)} per hour`;
		addChild(priceContainer, setText(dom.div('value_metric'), valueText));
	}

	addChild(section, priceContainer);

	if (comparison) addChild(section, comparison);
	if (rarity) addChild(section, rarity);

	return section;
}

function createComparison(
	steamPrice: number,
	dealPrice: number,
	savings: number,
	currency: string,
	discount: number,
	url: string
): HTMLElement {
	const container = dom.div();

	addChild(
		container,
		addChild(
			dom.div('deal_discount'),
			setText(dom.span('highlight_green'), `${discount}%`),
			' off Steam'
		)
	);

	const comparisonDiv = dom.div('deal_comparison');

	if (steamPrice === dealPrice) {
		addChild(comparisonDiv, setText(dom.span('steam_comparison'), 'Equal to Steam'));
	} else if (savings < 0) {
		addChild(comparisonDiv, setText(dom.span('steam_comparison'), 'Worse than Steam'));
	} else {
		const savingsText = formatPrice(Math.abs(savings), currency);
		addChild(
			comparisonDiv,
			addChild(
				dom.span('deal_text'),
				'Save extra ',
				setText(dom.span('highlight_green'), savingsText)
			)
		);
	}

	addChild(container, comparisonDiv);

	addChild(
		container,
		addChild(
			dom.div('deal_button'),
			addChild(
				setAttribute(
					setAttribute(dom.a(url), 'target', '_blank'),
					'class',
					'btnv6_blue_hoverfade btn_medium'
				),
				setText(dom.span(), 'View Deals')
			)
		)
	);

	return container;
}

function createResourcesSection(gameTitle: string, appId: string): HTMLElement {
	const links = [
		{ url: getHltbUrl(gameTitle), text: 'How Long to Beat' },
		{ url: getYouTubeUrl(gameTitle), text: 'YouTube' },
		{ url: getSteamDbUrl(appId), text: 'SteamDB' },
	];

	const resourcesContainer = dom.div('additional_resources');

	links.forEach((link) => {
		addChild(
			resourcesContainer,
			addChild(
				setAttribute(setAttribute(dom.a(link.url), 'target', '_blank'), 'class', 'linkbar'),
				setText(dom.span(), link.text)
			)
		);
	});

	return addChild(
		dom.div('deal_section'),
		setText(dom.div('deal_header'), 'Additional Resources'),
		resourcesContainer
	);
}

function createSpecialGameContent(
	header: string,
	statusText: string,
	gameTitle: string,
	appId: string
): HTMLElement {
	return addChild(
		dom.div(),
		addChild(
			dom.div('deal_section'),
			setText(dom.div('deal_header'), header),
			addChild(dom.div('deal_status'), setText(dom.span(), statusText))
		),
		createResourcesSection(gameTitle, appId),
		createSimpleFooter()
	);
}

export function createFreeGameContent(gameData: ProcessedGameData): HTMLElement {
	return createSpecialGameContent(
		'🎮 Free to Play',
		'This game is free to play',
		gameData.title,
		gameData.appId
	);
}

export function createComingSoonContent(gameData: ProcessedGameData): HTMLElement {
	return createSpecialGameContent(
		'📅 Coming Soon',
		gameData.lootScout.steam.status.text,
		gameData.title,
		gameData.appId
	);
}

export async function createSuccessContent(gameData: ProcessedGameData): Promise<HTMLElement> {
	const { lootScout } = gameData;

	if (!gameData.deal || !lootScout.currentBest || !lootScout.historicalBest) {
		if (lootScout.steam.status.className === 'steam_free_game') {
			return createFreeGameContent(gameData);
		}
		if (lootScout.steam.status.className === 'steam_coming_soon') {
			return createComingSoonContent(gameData);
		}
	}

	const isRecent = gameData.releaseDate ? isRecentlyReleased(gameData.releaseDate) : false;

	const rarities = await Promise.all([
		createRarityComponent(
			gameData.steam.discount_percent,
			gameData.steam.reviewScore,
			gameData.steam.averagePlaytime,
			gameData.steam.reviewSummary,
			isRecent
		),
		createRarityComponent(
			lootScout.currentBest!.rawDiscount,
			gameData.steam.reviewScore,
			gameData.steam.averagePlaytime,
			gameData.steam.reviewSummary,
			isRecent
		),
		createRarityComponent(
			lootScout.historicalBest!.rawDiscount,
			gameData.steam.reviewScore,
			gameData.steam.averagePlaytime,
			gameData.steam.reviewSummary,
			isRecent
		),
	]);

	const steamStatusElement = addChild(
		dom.div('steam_comparison'),
		setText(dom.span(lootScout.steam.status.className), lootScout.steam.status.text)
	);

	const sections = [
		createDealSection(
			'Steam Discount Rating',
			gameData.steam.final,
			gameData.steam.currency,
			gameData.steam.discount_percent,
			lootScout.costPerHour?.steam,
			steamStatusElement,
			rarities[0]
		),
		createDealSection(
			'Current Best Deal',
			gameData.deal!.currentBest,
			gameData.deal!.currency,
			lootScout.currentBest!.rawDiscount,
			lootScout.costPerHour?.currentBest,
			createComparison(
				gameData.steam.final,
				gameData.deal!.currentBest,
				lootScout.currentBest!.savings,
				gameData.deal!.currency,
				lootScout.currentBest!.discount,
				gameData.deal!.url
			),
			rarities[1]
		),
		createDealSection(
			'Historical Low',
			gameData.deal!.historicalBest,
			gameData.deal!.currency,
			lootScout.historicalBest!.rawDiscount,
			lootScout.costPerHour?.historicalBest,
			createComparison(
				gameData.steam.final,
				gameData.deal!.historicalBest,
				lootScout.historicalBest!.savings,
				gameData.deal!.currency,
				lootScout.historicalBest!.discount,
				gameData.deal!.url
			),
			rarities[2]
		),
		createResourcesSection(gameData.title, gameData.appId),
		createStandardFooter(),
	];

	return addChild(dom.div(), ...sections);
}
