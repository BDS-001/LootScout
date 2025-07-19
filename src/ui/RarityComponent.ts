import { getRarity } from '../helpers/getRarity';
import { RARITY_CHART } from '../constants/rarityChart';

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

function showTooltip(tooltip: HTMLElement) {
	tooltip.style.visibility = 'visible';
	tooltip.style.opacity = '1';
}

function hideTooltip(tooltip: HTMLElement) {
	tooltip.style.visibility = 'hidden';
	tooltip.style.opacity = '0';
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
		showTooltip(tooltip);
	});

	rarityElement.addEventListener('mouseleave', () => {
		hideTooltip(tooltip);
	});
}

function generateTooltipContent(): string {
	return RARITY_CHART.map(
		(item) =>
			`<div class="tooltip-item"><strong class="rarity-${item.name.toLowerCase()}">${item.name}:</strong> ${item.range} – ${item.description}</div>`
	).join('');
}

export async function createRarityComponent(
	percentage: number,
): Promise<string> {
	const rarity = await getRarity(percentage);
	const rarityClass = rarity.toLowerCase();
	const componentId = `rarity-${Math.random().toString(36).substring(2, 9)}`;
	const positionClass = 'deal_rarity_corner';

	setTimeout(() => attachTooltipEvents(componentId), 100);

	return `<div class="deal_rarity ${positionClass}" id="${componentId}">
    <span class="rarity-badge rarity-${rarityClass} rarity-${rarityClass}-bg" data-tooltip="true">${rarity}</span>
    <div class="rarity-tooltip">
      <div class="tooltip-header">Rarity Chart:</div>
      ${generateTooltipContent()}
    </div>
  </div>`;
}
