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

function getReviewScoreBonus(reviewScore: number): number {
	const BONUS = 9;
	const PENALTY = 4;
	const CRITICAL_PENALTY = 1;

	if (reviewScore >= BONUS) return 1;
	if (reviewScore <= CRITICAL_PENALTY) return -2;
	if (reviewScore <= PENALTY) return -1;
	return 0;
}

function getPlaytimeBonus(playtime: number): number {
	const CRITICAL_BONUS = 80;
	const BONUS = 30;
	const PENALTY = 5;

	if (playtime >= CRITICAL_BONUS) return 2;
	if (playtime >= BONUS) return 1;
	if (playtime <= PENALTY) return -1;
	return 0;
}

export async function getRarity(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null
): Promise<string> {
	const analysis = await getRarityAnalysis(percentage, reviewScore, playtime);
	return analysis.name;
}

export interface RarityAnalysis {
	name: string;
	baseScore: number;
	reviewBonus: number;
	playtimeBonus: number;
	finalScore: number;
	reviewScore?: number;
	playtime?: number;
}

export async function getRarityAnalysis(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null
): Promise<RarityAnalysis> {
	const { includeReviewScore, includePlaytime } = await getRaritySettings();
	const baseScore = getDiscountValue(percentage);

	const reviewBonus =
		includeReviewScore && reviewScore !== null ? getReviewScoreBonus(reviewScore) : 0;
	const playtimeBonus = includePlaytime && playtime !== null ? getPlaytimeBonus(playtime) : 0;

	const finalScore = Math.max(
		0,
		Math.min(baseScore + reviewBonus + playtimeBonus, MAX_RARITY_INDEX)
	);

	return {
		name: RARITY_CHART[finalScore].name,
		baseScore,
		reviewBonus,
		playtimeBonus,
		finalScore,
		reviewScore: reviewScore || undefined,
		playtime: playtime || undefined,
	};
}
