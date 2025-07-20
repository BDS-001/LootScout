import { getRarityAnalysis, RarityAnalysis } from '../helpers/getRarity';
import { RARITY_CHART } from '../constants/rarityChart';

const REVIEW_DESCRIPTIONS = [
	'Overwhelmingly Negative',
	'Very Negative',
	'Mostly Negative',
	'Mixed',
	'Mostly Positive',
	'Very Positive',
	'Overwhelmingly Positive',
];

const PLAYTIME_THRESHOLDS: Record<number, string> = {
	2: '≥80 hours',
	1: '≥30 hours',
	[-1]: '≤5 hours',
};

function calculateTooltipPosition(rect: DOMRect, tooltipWidth: number, tooltipHeight: number) {
	const windowWidth = window.innerWidth;
	let leftPosition = rect.left;

	if (leftPosition + tooltipWidth > windowWidth) {
		leftPosition = windowWidth - tooltipWidth - 10;
	}

	return {
		left: leftPosition,
		top: rect.top - tooltipHeight - 5,
	};
}

function attachTooltipEvents(componentId: string) {
	const rarityElement = document.querySelector(`#${componentId} .rarity-badge`) as HTMLElement;
	const tooltip = document.querySelector(`#${componentId} .rarity-tooltip`) as HTMLElement;

	if (!rarityElement || !tooltip) return;

	rarityElement.addEventListener('mouseenter', () => {
		const rect = rarityElement.getBoundingClientRect();
		const position = calculateTooltipPosition(rect, tooltip.offsetWidth, tooltip.offsetHeight);

		tooltip.style.left = `${position.left}px`;
		tooltip.style.top = `${position.top}px`;
		tooltip.style.visibility = 'visible';
		tooltip.style.opacity = '1';
	});

	rarityElement.addEventListener('mouseleave', () => {
		tooltip.style.visibility = 'hidden';
		tooltip.style.opacity = '0';
	});
}

function formatModifier(bonus: number): string {
	const tierText = bonus === 0 ? ' tiers' : ` tier${Math.abs(bonus) > 1 ? 's' : ''}`;
	const sign = bonus >= 0 ? '+' : '';
	return `${sign}${bonus}${tierText}`;
}

function getReviewDescription(reviewScore: number): string {
	return REVIEW_DESCRIPTIONS[Math.min(Math.floor(reviewScore / 1.5), 6)] || 'Mixed';
}

function getPlaytimeDescription(bonus: number): string {
	return PLAYTIME_THRESHOLDS[bonus] || 'standard';
}

function generateAnalysisTooltipContent(analysis: RarityAnalysis): string {
	const startingRarity = RARITY_CHART[analysis.baseScore].name;
	const range = RARITY_CHART[analysis.baseScore].range;

	const formatModifierLine = (label: string, bonus: number, description: string) => {
		const modifier = formatModifier(bonus);
		const colorClass =
			bonus < 0 ? 'modifier-negative' : bonus === 0 ? 'modifier-neutral' : 'modifier-positive';
		return `<div><span class="breakdown-label">${label}:</span> <span class="modifier-text ${colorClass}">${modifier}</span> <span class="detail-text">(${description})</span></div>`;
	};

	return `
		<div class="score-breakdown">
			<div><span class="breakdown-label">Discount:</span> <span class="rarity-${startingRarity.toLowerCase()}">${startingRarity}</span> <span class="detail-text">(${range})</span></div>
			${analysis.reviewScore ? formatModifierLine('Review Score', analysis.reviewBonus, getReviewDescription(analysis.reviewScore)) : ''}
			${analysis.playtime ? formatModifierLine('Playtime', analysis.playtimeBonus, getPlaytimeDescription(analysis.playtimeBonus)) : ''}
		</div>
		<div class="final-rarity">
			<strong class="rarity-${analysis.name.toLowerCase()}">${analysis.name}</strong>
		</div>
	`;
}

export async function createRarityComponent(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null
): Promise<string> {
	const analysis = await getRarityAnalysis(percentage, reviewScore, playtime);
	const rarityClass = analysis.name.toLowerCase();
	const componentId = `rarity-${Math.random().toString(36).substring(2, 9)}`;
	const positionClass = 'deal_rarity_corner';

	setTimeout(() => attachTooltipEvents(componentId), 100);

	return `<div class="deal_rarity ${positionClass}" id="${componentId}">
    <span class="rarity-badge rarity-${rarityClass}" data-tooltip="true">${analysis.name}</span>
    <div class="rarity-tooltip">
      <div class="tooltip-header">Deal Analysis:</div>
      ${generateAnalysisTooltipContent(analysis)}
    </div>
  </div>`;
}
