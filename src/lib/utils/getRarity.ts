import { getSettings } from '../services/SettingsService';
import { RARITY_CHART } from '../constants/rarityChart';
import { ModifierConfig } from '../shared/types';

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
	isRecentlyReleased: boolean;
}

const MAX_RARITY_INDEX = 7;
const IRIDESCENT_RARITY_INDEX = 8;

function isValidPlaytime(playtime: number | null): boolean {
	return playtime !== null && playtime !== -1;
}

function getDiscountValue(percentage: number): number {
	switch (true) {
		case percentage >= 100:
			return 8;
		case percentage >= 90:
			return 7;
		case percentage >= 80:
			return 6;
		case percentage >= 60:
			return 5;
		case percentage >= 45:
			return 4;
		case percentage >= 30:
			return 3;
		case percentage >= 15:
			return 2;
		default:
			return 1;
	}
}

function getModifierEffect(value: number, config: ModifierConfig): number {
	const { criticalBonus, bonus, penalty, criticalPenalty } = config;

	if (criticalBonus.active && value >= criticalBonus.threshold) return criticalBonus.effect;
	if (bonus.active && value >= bonus.threshold) return bonus.effect;
	if (criticalPenalty.active && value <= criticalPenalty.threshold) return criticalPenalty.effect;
	if (penalty.active && value <= penalty.threshold) return penalty.effect;
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
		isRecentlyReleased: false,
	};
}

export async function getRarity(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null,
	isRecentlyReleased: boolean = false
): Promise<string> {
	const analysis = await getRarityAnalysis(percentage, reviewScore, playtime, isRecentlyReleased);
	return analysis.name;
}

export async function getRarityAnalysis(
	percentage: number,
	reviewScore: number | null = null,
	playtime: number | null = null,
	isRecentlyReleased: boolean = false
): Promise<RarityAnalysis> {
	if (percentage >= 100) {
		return createIridescentAnalysis();
	}

	const { modifiers } = await getSettings();
	const baseScore = getDiscountValue(percentage);

	const reviewBonus =
		modifiers.review.active && reviewScore !== null
			? getModifierEffect(reviewScore, modifiers.review)
			: 0;
	const playtimeBonus =
		modifiers.playtime.active && isValidPlaytime(playtime)
			? getModifierEffect(playtime!, modifiers.playtime)
			: 0;

	const finalScore = Math.max(
		0,
		Math.min(baseScore + reviewBonus + (isRecentlyReleased ? 0 : playtimeBonus), MAX_RARITY_INDEX)
	);

	return {
		name: RARITY_CHART[finalScore].name,
		baseScore,
		reviewBonus,
		playtimeBonus,
		finalScore,
		reviewScore: reviewScore || undefined,
		playtime: isValidPlaytime(playtime) ? playtime! : undefined,
		reviewScoreUsed: modifiers.review.active,
		playtimeUsed: modifiers.playtime.active,
		isRecentlyReleased,
	};
}
