export default function generateRarityTestDiv() {
    // Test rarity elements
	const rarityTestDiv = document.createElement('div');
	rarityTestDiv.style.marginTop = '10px';

	const rarities = [
		'common',
		'uncommon',
		'rare',
		'epic',
		'legendary',
		'mythic',
		'exotic',
		'iridescent',
	];
	rarities.forEach((rarity) => {
		const testElement = document.createElement('div');
		testElement.className = `rarity-${rarity}`;
		testElement.textContent = rarity;
		testElement.style.display = 'inline-block';
		testElement.style.margin = '4px';
		testElement.style.padding = '8px 12px';
		testElement.style.fontWeight = 'bold';
		testElement.style.textTransform = 'uppercase';
		rarityTestDiv.appendChild(testElement);
	});

    return rarityTestDiv
}