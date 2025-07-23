import { getRaritySettings } from '../services/SettingsService';
import { RARITY_CHART } from '../constants/rarityChart';
import { PLAYTIME_THRESHOLDS, REVIEW_THRESHOLDS } from '../constants/modifiers';

export interface RarityAnalysis {
	name: string;
	baseScore: number;
	reviewBonus: number;
	playtimeBonus: number;
	finalScore: number;
	reviewScore?: number;
	playtime?: number;
	reviewScoreUsed: boolean;
	playtimeUsed: boolean;
}

const MAX_RARITY_INDEX = 6;
const IRIDESCENT_RARITY_INDEX = 7;

function isValidPlaytime(playtime: number | null): boolean {
	return playtime !== null && playtime !== -1;
}

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
	if (reviewScore >= REVIEW_THRESHOLDS.BONUS) return 1;
	if (reviewScore <= REVIEW_THRESHOLDS.CRITICAL_PENALTY) return -2;
	if (reviewScore <= REVIEW_THRESHOLDS.PENALTY) return -1;
	return 0;
}

function getPlaytimeBonus(playtime: number): number {
	if (playtime >= PLAYTIME_THRESHOLDS.CRITICAL_BONUS) return 2;
	if (playtime >= PLAYTIME_THRESHOLDS.BONUS) return 1;
	if (playtime <= PLAYTIME_THRESHOLDS.PENALTY) return -1;
	return 0;
}

function createIridescentAnalysis(): RarityAnalysis {
	return {
		name: RARITY_CHART[IRIDESCENT_RARITY_INDEX].name,
		baseScore: IRIDESCENT_RARITY_INDEX,
		reviewBonus: 0,
		playtimeBonus: 0,
		finalScore: IRIDESCENT_RARITY_INDEX,
		reviewScore: undefined,
		playtime: undefined,
		reviewScoreUsed: false,
		playtimeUsed: false,
	};
}

export async function getRarity(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null
): Promise<string> {
	const analysis = await getRarityAnalysis(percentage, reviewScore, playtime);
	return analysis.name;
}

export async function getRarityAnalysis(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null
): Promise<RarityAnalysis> {
	if (percentage >= 100) {
		return createIridescentAnalysis();
	}

	const { includeReviewScore, includePlaytime } = await getRaritySettings();
	const baseScore = getDiscountValue(percentage);

	const reviewBonus =
		includeReviewScore && reviewScore !== null ? getReviewScoreBonus(reviewScore) : 0;
	const playtimeBonus =
		includePlaytime && isValidPlaytime(playtime) ? getPlaytimeBonus(playtime!) : 0;

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
		playtime: isValidPlaytime(playtime) ? playtime! : undefined,
		reviewScoreUsed: includeReviewScore,
		playtimeUsed: includePlaytime,
	};
}
