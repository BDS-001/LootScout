import { getRaritySettings } from '../services/SettingsService';
import { RARITY_CHART } from '../constants/rarityChart';

const MAX_RARITY_INDEX = 6;

function getDiscountValue(percentage: number): number {
	switch (true) {
		case percentage >= 100:
			return 7;
		case percentage >= 90:
			return 6;
		case percentage >= 80:
			return 5;
		case percentage >= 60:
			return 4;
		case percentage >= 45:
			return 3;
		case percentage >= 30:
			return 2;
		case percentage >= 15:
			return 1;
		default:
			return 0;
	}
}

function reviewScoreModifier(rarityIndex: number, reviewScore: number): number {
	const BONUS = 9;
	const PENALTY = 4;
	const CRITICAL_PENALTY = 1;

	if (reviewScore >= BONUS) return Math.min(rarityIndex + 1, MAX_RARITY_INDEX);
	if (reviewScore <= CRITICAL_PENALTY) return Math.max(rarityIndex - 2, 0);
	if (reviewScore <= PENALTY) return Math.max(rarityIndex - 1, 0);
	return rarityIndex;
}

function playtimeModifier(rarityIndex: number, playtime: number): number {
	const CRITICAL_BONUS = 80;
	const BONUS = 30;
	const PENALTY = 5;

	if (playtime >= CRITICAL_BONUS) return Math.min(rarityIndex + 2, MAX_RARITY_INDEX);
	if (playtime >= BONUS) return Math.min(rarityIndex + 1, MAX_RARITY_INDEX);
	if (playtime <= PENALTY) return Math.max(rarityIndex - 1, 0);
	return rarityIndex;
}

export async function getRarity(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null
): Promise<string> {
	const { includeReviewScore, includePlaytime } = await getRaritySettings();
	let rarityIndex = getDiscountValue(percentage);

	if (includeReviewScore && reviewScore !== null) {
		rarityIndex = reviewScoreModifier(rarityIndex, reviewScore);
	}

	if (includePlaytime && playtime !== null) {
		rarityIndex = playtimeModifier(rarityIndex, playtime);
	}

	return RARITY_CHART[rarityIndex].name;
}
