import globalCss from '../styles/steam-content.css?inline';
import raritiesCss from '../styles/rarities.css?inline';
import rightcolCss from '../styles/rightcol.css?inline';
import rarityTooltipCss from '../styles/rarity-tooltip.css?inline';

export default function injectCSS(): void {
	// Inject global CSS first to ensure variables are available
	const globalStyle = document.createElement('style');
	globalStyle.textContent = globalCss;
	document.head.appendChild(globalStyle);

	const raritiesStyle = document.createElement('style');
	raritiesStyle.textContent = raritiesCss;
	document.head.appendChild(raritiesStyle);

	const rightcolStyle = document.createElement('style');
	rightcolStyle.textContent = rightcolCss;
	document.head.appendChild(rightcolStyle);

	const rarityTooltipStyle = document.createElement('style');
	rarityTooltipStyle.textContent = rarityTooltipCss;
	document.head.appendChild(rarityTooltipStyle);
}
