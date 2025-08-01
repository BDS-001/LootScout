import * as dom from '../utils/DomBuilder';

const RECENT_RELEASE_THRESHOLD_DAYS = 14;
const TOOLTIP_ATTACHMENT_DELAY_MS = 100;

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

function attachAsteriskTooltip(asteriskId: string): void {
	setTimeout(() => {
		const asterisk = document.querySelector(`#${asteriskId}`) as HTMLElement;
		const tooltip = document.querySelector(`#${asteriskId} .rarity-tooltip`) as HTMLElement;
		if (!asterisk || !tooltip) return;

		asterisk.addEventListener('mouseenter', () => {
			const rect = asterisk.getBoundingClientRect();
			tooltip.style.left = Math.min(rect.left, window.innerWidth - tooltip.offsetWidth - 10) + 'px';
			tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
			tooltip.style.visibility = 'visible';
			tooltip.style.opacity = '1';
		});

		asterisk.addEventListener('mouseleave', () => {
			tooltip.style.visibility = 'hidden';
			tooltip.style.opacity = '0';
		});
	}, TOOLTIP_ATTACHMENT_DELAY_MS);
}

function createPlaytimeAsterisk(): HTMLElement {
	const id = `playtime-asterisk-${Date.now()}`;
	const asterisk = dom.setAttribute(
		dom.setText(dom.createElement('span', 'playtime-asterisk'), '*'),
		'id',
		id
	);

	const tooltip = dom.createElement('div', 'rarity-tooltip');
	const line1 = dom.setText(
		dom.createElement('div'),
		`Recently released (< ${RECENT_RELEASE_THRESHOLD_DAYS} days)`
	);
	const line2 = dom.setText(dom.createElement('div'), 'Playtime data may be limited.');

	dom.addChild(tooltip, line1, line2);
	dom.addChild(asterisk, tooltip);
	attachAsteriskTooltip(id);
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
