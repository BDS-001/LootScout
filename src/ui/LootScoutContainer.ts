import { GameData, ApiError } from '../shared/types';
import { createLoadingContent, createErrorContent, createSuccessContent } from './LootScoutContent';

const ELEMENT_IDS = {
	CONTAINER: 'lootscout-container',
	HEADER: 'lootscout-header',
	CONTENT: 'lootscout-content',
} as const;

export interface ContainerState {
	status: 'loading' | 'success' | 'error';
	gameData?: GameData;
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
	header.className = 'block responsive_apppage_details_right heading';
	header.id = ELEMENT_IDS.HEADER;
	header.textContent = 'LootScout';

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

function createGameTitleSection(title: string): string {
	return `<div class="game-title-section">${title}</div>`;
}

export function updateContainerState(container: HTMLElement, state: ContainerState): void {
	const elements = getContainerElements(container);
	if (!elements) return;

	switch (state.status) {
		case 'loading':
			elements.content.innerHTML = createLoadingContent();
			break;

		case 'success':
			if (state.gameData) {
				const gameTitle = state.gameData.title ? createGameTitleSection(state.gameData.title) : '';
				elements.content.innerHTML =
					gameTitle + createSuccessContent(state.gameData, state.countryCode);
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
