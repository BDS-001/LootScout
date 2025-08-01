import { getRarityAnalysis, RarityAnalysis } from '../helpers/getRarity';
import { RARITY_CHART } from '../constants/rarityChart';
import { PLAYTIME_THRESHOLDS } from '../constants/modifiers';
import * as dom from '../utils/DomBuilder';

// Simplified tooltip positioning
function attachTooltipEvents(badge: HTMLElement, tooltip: HTMLElement) {
	badge.addEventListener('mouseenter', () => {
		const rect = badge.getBoundingClientRect();
		const x = Math.min(rect.left, window.innerWidth - tooltip.offsetWidth - 10);
		const y = rect.top - tooltip.offsetHeight - 5;

		tooltip.style.setProperty('--tooltip-x', `${x}px`);
		tooltip.style.setProperty('--tooltip-y', `${y}px`);
		tooltip.classList.add('show');
	});

	badge.addEventListener('mouseleave', () => {
		tooltip.classList.remove('show');
	});
}

// Simplified helper functions
function formatModifier(bonus: number): string {
	return `${bonus >= 0 ? '+' : ''}${bonus} tier${Math.abs(bonus) === 1 ? '' : 's'}`;
}

function getPlaytimeDesc(bonus: number): string {
	const t = PLAYTIME_THRESHOLDS;
	return bonus === 2
		? `≥${t.CRITICAL_BONUS} hours`
		: bonus === 1
			? `≥${t.BONUS} hours`
			: bonus === -1
				? `≤${t.PENALTY} hours`
				: 'standard';
}

function getColorClass(bonus: number): string {
	return bonus < 0 ? 'modifier-negative' : bonus === 0 ? 'modifier-neutral' : 'modifier-positive';
}

function createTooltipContent(
	analysis: RarityAnalysis,
	reviewSummary: string | null = null
): HTMLElement {
	const base = RARITY_CHART[analysis.baseScore];

	const scoreBreakdown = dom.createElement('div', 'score-breakdown');

	// Discount line
	const discountDiv = dom.createElement('div');
	dom.addChild(
		discountDiv,
		dom.setText(dom.createElement('span', 'breakdown-label'), 'Discount:'),
		' ',
		dom.setText(dom.createElement('span', `rarity-${base.name.toLowerCase()}`), base.name),
		' ',
		dom.setText(dom.createElement('span', 'detail-text'), `(${base.range})`)
	);
	dom.addChild(scoreBreakdown, discountDiv);

	// Review line
	if (analysis.reviewScoreUsed && analysis.reviewScore !== undefined) {
		const reviewDiv = dom.createElement('div');
		dom.addChild(
			reviewDiv,
			dom.setText(dom.createElement('span', 'breakdown-label'), 'Review Score:'),
			' ',
			dom.setText(
				dom.createElement('span', `modifier-text ${getColorClass(analysis.reviewBonus)}`),
				formatModifier(analysis.reviewBonus)
			),
			' ',
			dom.setText(dom.createElement('span', 'detail-text'), `(${reviewSummary || 'Missing'})`)
		);
		dom.addChild(scoreBreakdown, reviewDiv);
	}

	// Playtime line
	if (analysis.playtimeUsed && analysis.playtime !== undefined) {
		const playtimeDiv = dom.createElement('div');
		dom.addChild(
			playtimeDiv,
			dom.setText(dom.createElement('span', 'breakdown-label'), 'Playtime:'),
			' ',
			dom.setText(
				dom.createElement('span', `modifier-text ${getColorClass(analysis.playtimeBonus)}`),
				formatModifier(analysis.playtimeBonus)
			),
			' ',
			dom.setText(
				dom.createElement('span', 'detail-text'),
				`(${getPlaytimeDesc(analysis.playtimeBonus)})`
			)
		);
		dom.addChild(scoreBreakdown, playtimeDiv);
	}

	const finalRarity = dom.addChild(
		dom.createElement('div', 'final-rarity'),
		dom.setText(dom.createElement('strong', `rarity-${analysis.name.toLowerCase()}`), analysis.name)
	);

	return dom.addChild(dom.createElement('div'), scoreBreakdown, finalRarity);
}

export async function createRarityComponent(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null,
	reviewSummary: string | null = null
): Promise<HTMLElement> {
	const analysis = await getRarityAnalysis(percentage, reviewScore, playtime);
	const id = `rarity-${Math.random().toString(36).substring(2, 9)}`;
	const rarity = analysis.name.toLowerCase();

	const container = dom.setAttribute(
		dom.createElement('div', 'deal_rarity deal_rarity_corner'),
		'id',
		id
	);

	const badge = dom.setAttribute(
		dom.setText(dom.createElement('span', `rarity-badge rarity-${rarity}`), analysis.name),
		'data-tooltip',
		'true'
	);

	const tooltip = dom.addChild(
		dom.createElement('div', 'rarity-tooltip'),
		dom.setText(dom.createElement('div', 'tooltip-header'), 'Deal Analysis:'),
		createTooltipContent(analysis, reviewSummary)
	);

	dom.addChild(container, badge, tooltip);

	attachTooltipEvents(badge, tooltip);

	return container;
}
