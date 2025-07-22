import { ProcessedGameData, ApiError, RegionCode } from '../shared/types';
import { createLoadingContent, createErrorContent, createSuccessContent } from './LootScoutContent';
import { getRegionInfo } from '../services/SettingsService';

const ELEMENT_IDS = {
	CONTAINER: 'lootscout-container',
	HEADER: 'lootscout-header',
	CONTENT: 'lootscout-content',
} as const;

const APP_NAME = 'LootScout';

export interface ContainerState {
	status: 'loading' | 'success' | 'error';
	gameData?: ProcessedGameData;
	error?: ApiError;
	countryCode?: string;
}

interface ContainerElements {
	container: HTMLElement;
	header: HTMLElement;
	content: HTMLElement;
}

function createContainerElements(): ContainerElements {
	const container = document.createElement('div');
	container.id = ELEMENT_IDS.CONTAINER;

	const header = document.createElement('div');
	header.className = 'block responsive_apppage_details_right heading lootscout-header';
	header.id = ELEMENT_IDS.HEADER;
	header.innerHTML = `<span class="header-title">${APP_NAME}</span>`;

	const content = document.createElement('div');
	content.className = 'block responsive_apppage_details_right recommendation_noinfo';
	content.id = ELEMENT_IDS.CONTENT;

	container.appendChild(header);
	container.appendChild(content);

	return { container, header, content };
}

export function createLootScoutContainer(): HTMLElement {
	const { container } = createContainerElements();

	updateContainerState(container, {
		status: 'loading',
	});

	return container;
}

function getContainerElements(container: HTMLElement): ContainerElements | null {
	const header = container.querySelector(`#${ELEMENT_IDS.HEADER}`) as HTMLElement;
	const content = container.querySelector(`#${ELEMENT_IDS.CONTENT}`) as HTMLElement;

	if (!header || !content) return null;

	return { container, header, content };
}

function createGameTitleSection(title: string, averagePlaytime?: number): string {
	const playtimeDisplay =
		averagePlaytime && averagePlaytime > 0
			? `<div class="game-playtime">Average playtime: ${averagePlaytime.toFixed(1)} hours</div>`
			: '';
	return `<div class="game-title-section">
		<div class="game-title">${title}</div>
		${playtimeDisplay}
	</div>`;
}

function updateHeader(header: HTMLElement, countryCode?: string): void {
	const regionInfo = countryCode ? createRegionDisplay(countryCode) : '';
	header.innerHTML = `
		<span class="header-title">${APP_NAME}</span>
		${regionInfo ? `<span class="header-region">${regionInfo}</span>` : ''}
	`;
}

function createRegionDisplay(countryCode: string): string {
	const countryInfo = getRegionInfo(countryCode as RegionCode);
	return countryInfo ? `${countryInfo.name} (${countryInfo.currency})` : countryCode.toUpperCase();
}

export async function updateContainerState(
	container: HTMLElement,
	state: ContainerState
): Promise<void> {
	const elements = getContainerElements(container);
	if (!elements) return;

	updateHeader(elements.header, state.countryCode);

	switch (state.status) {
		case 'loading':
			elements.content.innerHTML = createLoadingContent();
			break;

		case 'success':
			if (state.gameData) {
				const gameTitle = state.gameData.title
					? createGameTitleSection(state.gameData.title, state.gameData.steam.averagePlaytime)
					: '';
				const successContent = await createSuccessContent(state.gameData);
				elements.content.innerHTML = gameTitle + successContent;
			}
			break;

		case 'error':
			elements.content.innerHTML = createErrorContent(state.error);
			break;
	}
}

export function injectLootScoutContainer(): HTMLElement | null {
	const rightCol = document.querySelector('.rightcol.game_meta_data');
	if (!rightCol) {
		console.error('LootScout: .rightcol.game_meta_data element not found on Steam page');
		return null;
	}

	const container = createLootScoutContainer();
	rightCol.insertBefore(container, rightCol.firstChild);

	return container;
}
