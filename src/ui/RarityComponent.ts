import { getRarityAnalysis, RarityAnalysis } from '../helpers/getRarity';
import { RARITY_CHART } from '../constants/rarityChart';
import { PLAYTIME_THRESHOLDS } from '../constants/modifiers';

// Simplified tooltip positioning
function setTooltipPosition(tooltip: HTMLElement, rect: DOMRect) {
	tooltip.style.left = Math.min(rect.left, window.innerWidth - tooltip.offsetWidth - 10) + 'px';
	tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

function attachTooltipEvents(componentId: string) {
	const badge = document.querySelector(`#${componentId} .rarity-badge`) as HTMLElement;
	const tooltip = document.querySelector(`#${componentId} .rarity-tooltip`) as HTMLElement;
	if (!badge || !tooltip) return;

	badge.addEventListener('mouseenter', () => {
		setTooltipPosition(tooltip, badge.getBoundingClientRect());
		tooltip.style.visibility = 'visible';
		tooltip.style.opacity = '1';
	});
	badge.addEventListener('mouseleave', () => {
		tooltip.style.visibility = 'hidden';
		tooltip.style.opacity = '0';
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

function generateTooltipContent(
	analysis: RarityAnalysis,
	reviewSummary: string | null = null
): string {
	const base = RARITY_CHART[analysis.baseScore];
	const reviewLine =
		analysis.reviewScoreUsed && analysis.reviewScore !== undefined
			? `<div><span class="breakdown-label">Review Score:</span> <span class="modifier-text ${getColorClass(analysis.reviewBonus)}">${formatModifier(analysis.reviewBonus)}</span> <span class="detail-text">(${reviewSummary || 'Missing'})</span></div>`
			: '';
	const playtimeLine =
		analysis.playtimeUsed && analysis.playtime !== undefined
			? `<div><span class="breakdown-label">Playtime:</span> <span class="modifier-text ${getColorClass(analysis.playtimeBonus)}">${formatModifier(analysis.playtimeBonus)}</span> <span class="detail-text">(${getPlaytimeDesc(analysis.playtimeBonus)})</span></div>`
			: '';

	return `<div class="score-breakdown"><div><span class="breakdown-label">Discount:</span> <span class="rarity-${base.name.toLowerCase()}">${base.name}</span> <span class="detail-text">(${base.range})</span></div>${reviewLine}${playtimeLine}</div><div class="final-rarity"><strong class="rarity-${analysis.name.toLowerCase()}">${analysis.name}</strong></div>`;
}

export async function createRarityComponent(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null,
	reviewSummary: string | null = null
): Promise<string> {
	const analysis = await getRarityAnalysis(percentage, reviewScore, playtime);
	const id = `rarity-${Math.random().toString(36).substring(2, 9)}`;
	const rarity = analysis.name.toLowerCase();

	setTimeout(() => attachTooltipEvents(id), 100);

	return `<div class="deal_rarity deal_rarity_corner" id="${id}"><span class="rarity-badge rarity-${rarity}" data-tooltip="true">${analysis.name}</span><div class="rarity-tooltip"><div class="tooltip-header">Deal Analysis:</div>${generateTooltipContent(analysis, reviewSummary)}</div></div>`;
}
