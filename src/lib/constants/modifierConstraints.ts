import { RARITY_CHART } from './rarityChart';

export interface FieldConstraint {
	min: number;
	max: number;
	step: number;
}

export interface ModifierConstraints {
	threshold: FieldConstraint;
	effect: FieldConstraint;
}

export const MAX_EFFECT_SHIFT = RARITY_CHART.length - 2;

export const PLAYTIME_CONSTRAINTS: ModifierConstraints = {
	threshold: { min: 0, max: Infinity, step: 1 },
	effect: { min: -MAX_EFFECT_SHIFT, max: MAX_EFFECT_SHIFT, step: 1 },
};

export const REVIEW_CONSTRAINTS: ModifierConstraints = {
	threshold: { min: 1, max: 9, step: 1 },
	effect: { min: -MAX_EFFECT_SHIFT, max: MAX_EFFECT_SHIFT, step: 1 },
};

export const REVIEW_SCORE_LABELS: Record<number, string> = {
	1: 'Overwhelmingly Negative',
	2: 'Very Negative',
	3: 'Negative',
	4: 'Mostly Negative',
	5: 'Mixed',
	6: 'Mostly Positive',
	7: 'Positive',
	8: 'Very Positive',
	9: 'Overwhelmingly Positive',
};
