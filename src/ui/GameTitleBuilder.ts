import * as dom from '../utils/DomBuilder';

const RECENT_RELEASE_THRESHOLD_DAYS = 14;

function isRecentlyReleased(releaseDate: string): boolean {
	try {
		const releaseTime = new Date(releaseDate).getTime();
		const now = Date.now();
		const thresholdMs = RECENT_RELEASE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
		return now - releaseTime <= thresholdMs;
	} catch {
		return false;
	}
}

function attachAsteriskTooltip(asterisk: HTMLElement, tooltip: HTMLElement): void {
	asterisk.addEventListener('mouseenter', () => {
		const rect = asterisk.getBoundingClientRect();
		const x = Math.min(rect.left, window.innerWidth - (tooltip.offsetWidth || 280) - 10);
		const y = rect.top - tooltip.offsetHeight - 5;

		tooltip.style.setProperty('--tooltip-x', `${x}px`);
		tooltip.style.setProperty('--tooltip-y', `${y}px`);
		tooltip.classList.add('show');
	});

	asterisk.addEventListener('mouseleave', () => {
		tooltip.classList.remove('show');
	});
}

function createPlaytimeAsterisk(): HTMLElement {
	const asterisk = dom.setText(dom.createElement('span', 'playtime-asterisk'), '*');

	const tooltip = dom.createElement('div', 'rarity-tooltip');
	const line1 = dom.setText(
		dom.createElement('div'),
		`Recently released (< ${RECENT_RELEASE_THRESHOLD_DAYS} days)`
	);
	const line2 = dom.setText(dom.createElement('div'), 'Playtime data may be limited.');

	dom.addChild(tooltip, line1, line2);
	dom.addChild(asterisk, tooltip);
	attachAsteriskTooltip(asterisk, tooltip);
	return asterisk;
}

export function createGameTitleSection(
	title: string,
	averagePlaytime?: number,
	releaseDate?: string
): HTMLElement {
	const titleSection = dom.createElement('div', 'game-title-section');
	const titleDiv = dom.setText(dom.createElement('div', 'game-title'), title);
	dom.addChild(titleSection, titleDiv);

	if (averagePlaytime && averagePlaytime > 0) {
		const playtimeDiv = dom.createElement('div', 'game-playtime');
		dom.setText(playtimeDiv, `Average playtime: ${averagePlaytime.toFixed(1)} hours`);

		if (releaseDate && isRecentlyReleased(releaseDate)) {
			dom.addChild(playtimeDiv, createPlaytimeAsterisk());
		}

		dom.addChild(titleSection, playtimeDiv);
	}

	return titleSection;
}
