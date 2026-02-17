import * as dom from '../utils/DomBuilder';
import { isRecentlyReleased, RECENT_RELEASE_THRESHOLD_DAYS } from '../utils/gameAge';

function attachAsteriskTooltip(asterisk: HTMLElement, tooltip: HTMLElement): void {
	asterisk.addEventListener('mouseenter', () => {
		if (!tooltip.parentElement) {
			document.body.appendChild(tooltip);
		}

		const rect = asterisk.getBoundingClientRect();
		const x = Math.min(rect.left, window.innerWidth - (tooltip.offsetWidth || 280) - 10);
		const y = rect.top - tooltip.offsetHeight - 5;

		tooltip.style.setProperty('--tooltip-x', `${x}px`);
		tooltip.style.setProperty('--tooltip-y', `${y}px`);
		tooltip.classList.add('show');
	});

	asterisk.addEventListener('mouseleave', () => {
		tooltip.classList.remove('show');
		tooltip.remove();
	});
}

function createPlaytimeAsterisk(includePlaytime: boolean): HTMLElement {
	const asterisk = dom.setText(dom.createElement('span', 'playtime-asterisk'), '*');

	const tooltip = dom.createElement('div', 'rarity-tooltip');
	const line1 = dom.setText(
		dom.createElement('div'),
		`Recently released (< ${RECENT_RELEASE_THRESHOLD_DAYS} days)`
	);
	const line2 = dom.setText(dom.createElement('div'), 'Playtime data may be limited.');

	dom.addChild(tooltip, line1, line2);
	if (includePlaytime) {
		const line3 = dom.setText(
			dom.createElement('div'),
			'Playtime is not affecting the deal rarity'
		);
		dom.addChild(tooltip, line3);
	}

	attachAsteriskTooltip(asterisk, tooltip);
	return asterisk;
}

export function createGameTitleSection(
	title: string,
	averagePlaytime?: number,
	releaseDate?: string,
	includePlaytime: boolean = true
): HTMLElement {
	const titleSection = dom.createElement('div', 'game-title-section');
	const titleDiv = dom.setText(dom.createElement('div', 'game-title'), title);
	dom.addChild(titleSection, titleDiv);

	if (averagePlaytime && averagePlaytime > 0) {
		const playtimeDiv = dom.createElement('div', 'game-playtime');
		dom.setText(playtimeDiv, `Average playtime: ${averagePlaytime} hours`);

		if (releaseDate && isRecentlyReleased(releaseDate)) {
			dom.addChild(playtimeDiv, createPlaytimeAsterisk(includePlaytime));
		}

		dom.addChild(titleSection, playtimeDiv);
	}

	return titleSection;
}
