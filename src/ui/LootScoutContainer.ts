import { GameData, ApiError } from '../shared/types';
import { createLoadingContent, createErrorContent, createSuccessContent } from './LootScoutContent';

export interface ContainerState {
	status: 'loading' | 'success' | 'error';
	gameData?: GameData;
	error?: ApiError;
	appName?: string;
	countryCode?: string;
}

export function createLootScoutContainer(appName: string): HTMLElement {
	const container = document.createElement('div');
	container.id = 'lootscout-container';

	// Create header
	const headerDiv = document.createElement('div');
	headerDiv.className = 'block responsive_apppage_details_right heading';
	headerDiv.id = 'lootscout-header';
	headerDiv.textContent = `LootScout | ${appName}`;

	// Create content area
	const contentDiv = document.createElement('div');
	contentDiv.className = 'block responsive_apppage_details_right recommendation_noinfo';
	contentDiv.id = 'lootscout-content';

	container.appendChild(headerDiv);
	container.appendChild(contentDiv);

	// Set initial loading state
	updateContainerState(container, {
		status: 'loading',
		appName,
	});

	return container;
}

export function updateContainerState(container: HTMLElement, state: ContainerState): void {
	const headerDiv = container.querySelector('#lootscout-header') as HTMLElement;
	const contentDiv = container.querySelector('#lootscout-content') as HTMLElement;

	if (!headerDiv || !contentDiv) return;

	if (state.appName) {
		headerDiv.textContent = `LootScout | ${state.appName}`;
	}

	switch (state.status) {
		case 'loading':
			contentDiv.innerHTML = createLoadingContent();
			break;

		case 'success':
			if (state.gameData) {
				contentDiv.innerHTML = createSuccessContent(state.gameData, state.countryCode);
			}
			break;

		case 'error':
			contentDiv.innerHTML = createErrorContent(state.error);
			break;
	}
}

export function injectLootScoutContainer(appName: string): HTMLElement | null {
	const rightCol = document.querySelector('.rightcol.game_meta_data');
	if (!rightCol) {
		console.error('LootScout: .rightcol.game_meta_data element not found on Steam page');
		return null;
	}

	const container = createLootScoutContainer(appName);
	rightCol.insertBefore(container, rightCol.firstChild);

	return container;
}
