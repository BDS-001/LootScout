import raritiesCss from '../styles/rarities.css?inline';
import rightcolCss from '../styles/rightcol.css?inline';
import rarityTooltipCss from '../styles/rarity-tooltip.css?inline';

export default function injectCSS(): void {
	// const style = document.createElement('style');
	// style.textContent = contentCss;
	// document.head.appendChild(style);

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
