import { ProcessedGameData, ApiError, RegionCode } from '../../lib/shared/types';
import {
	createLoadingContent,
	createErrorContent,
	createSuccessContent,
} from './SecureContentBuilder';
import { createGameTitleSection } from './GameTitleBuilder';
import { getRegionInfo, getRaritySettings } from '../../lib/services/SettingsService';
import * as dom from '../utils/DomBuilder';
import { debug } from '../../lib/utils/debug';
import browser from 'webextension-polyfill';

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
	const container = dom.setAttribute(dom.createElement('div'), 'id', ELEMENT_IDS.CONTAINER);

	const header = dom.setAttribute(
		dom.createElement('div', 'block responsive_apppage_details_right heading lootscout-header'),
		'id',
		ELEMENT_IDS.HEADER
	);

	const content = dom.setAttribute(
		dom.createElement('div', 'block responsive_apppage_details_right recommendation_noinfo'),
		'id',
		ELEMENT_IDS.CONTENT
	);

	dom.addChild(container, header);
	dom.addChild(container, content);

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

function updateHeader(header: HTMLElement, countryCode?: string): void {
	dom.clearElement(header);

	const titleSpan = dom.setText(dom.createElement('span', 'header-title'), APP_NAME);
	dom.addChild(header, titleSpan);

	if (countryCode) {
		const regionInfo = createRegionDisplay(countryCode);
		const regionSpan = dom.setText(dom.createElement('span', 'header-region'), regionInfo);

		const gearIcon = dom.onClick(
			dom.setText(dom.createElement('span', 'header-settings-icon'), '\u2699'),
			() => browser.runtime.sendMessage({ action: 'openSettings' })
		);

		const regionGroup = dom.addChild(
			dom.createElement('span', 'header-region-group'),
			regionSpan,
			gearIcon
		);
		dom.addChild(header, regionGroup);
	}
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
			dom.replaceElementContent(elements.content, createLoadingContent());
			break;

		case 'success':
			if (state.gameData) {
				const children: HTMLElement[] = [];
				const raritySettings = await getRaritySettings();

				if (state.gameData.title) {
					children.push(
						createGameTitleSection(
							state.gameData.title,
							state.gameData.steam.averagePlaytime,
							state.gameData.releaseDate,
							raritySettings.includePlaytime
						)
					);
				}

				const successContent = await createSuccessContent(state.gameData);
				children.push(successContent);

				dom.replaceElementContent(elements.content, ...children);
			}
			break;

		case 'error':
			dom.replaceElementContent(elements.content, createErrorContent(state.error));
			break;
	}
}

export function injectLootScoutContainer(): HTMLElement | null {
	const rightCol = document.querySelector('.rightcol.game_meta_data');
	if (!rightCol) {
		debug.error('.rightcol.game_meta_data element not found on Steam page');
		return null;
	}

	const container = createLootScoutContainer();
	rightCol.insertBefore(container, rightCol.firstChild);

	return container;
}
