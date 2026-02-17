import { ModifierConfig } from '../shared/types';
import {
	ModifierConstraints,
	MAX_EFFECT_SHIFT,
	PLAYTIME_CONSTRAINTS,
	REVIEW_CONSTRAINTS,
} from '../constants/modifierConstraints';

const MODIFIER_ORDER: (keyof ModifierConfig)[] = [
	'criticalBonus',
	'bonus',
	'penalty',
	'criticalPenalty',
];

const POSITIVE_EFFECT_KEYS: (keyof ModifierConfig)[] = ['criticalBonus', 'bonus'];

function hasExpectedEffectDirection(key: keyof ModifierConfig, effect: number): boolean {
	if (POSITIVE_EFFECT_KEYS.includes(key)) {
		return effect > 0;
	}

	return effect < 0;
}

function isEffectWithinRange(effect: number): boolean {
	return Math.abs(effect) <= MAX_EFFECT_SHIFT;
}

function getActiveModifiersInOrder(config: ModifierConfig) {
	return MODIFIER_ORDER.map((key) => ({ key, modifier: config[key] })).filter(
		({ modifier }) => modifier.active
	);
}

function validateModifiers(config: ModifierConfig, constraints: ModifierConstraints): boolean {
	const activeModifiers = getActiveModifiersInOrder(config);

	for (let i = 0; i < activeModifiers.length; i++) {
		const { key, modifier } = activeModifiers[i];
		const { threshold, effect } = modifier;

		if (threshold < constraints.threshold.min || threshold > constraints.threshold.max) {
			return false;
		}

		if (!hasExpectedEffectDirection(key, effect)) {
			return false;
		}

		if (!isEffectWithinRange(effect)) {
			return false;
		}

		if (i === 0) {
			continue;
		}

		const previous = activeModifiers[i - 1].modifier;
		const thresholdDelta = previous.threshold - threshold;
		const effectDelta = previous.effect - effect;

		if (thresholdDelta < constraints.threshold.step) {
			return false;
		}

		if (effectDelta < constraints.effect.step) {
			return false;
		}
	}

	return true;
}

export function validatePlaytimeModifiers(config: ModifierConfig): boolean {
	return validateModifiers(config, PLAYTIME_CONSTRAINTS);
}

// Steam review_score scale (1-9):
// 1: Overwhelmingly Negative
// 2: Very Negative
// 3: Negative
// 4: Mostly Negative
// 5: Mixed
// 6: Mostly Positive
// 7: Positive
// 8: Very Positive
// 9: Overwhelmingly Positive
export function validateReviewModifiers(config: ModifierConfig): boolean {
	return validateModifiers(config, REVIEW_CONSTRAINTS);
}
