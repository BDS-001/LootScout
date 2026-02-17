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
