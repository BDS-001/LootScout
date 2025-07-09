export function getRarity(percentage: number): string {
	if (percentage >= 100) {
		return 'Iridescent';
	} else if (percentage >= 90) {
		return 'Exotic';
	} else if (percentage >= 80) {
		return 'Mythic';
	} else if (percentage >= 60) {
		return 'Legendary';
	} else if (percentage >= 45) {
		return 'Epic';
	} else if (percentage >= 30) {
		return 'Rare';
	} else if (percentage >= 15) {
		return 'Uncommon';
	} else {
		return 'Common';
	}
}
