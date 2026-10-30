import { ModifierConfig } from '../shared/types';
import {
	ModifierConstraints,
	MAX_EFFECT_SHIFT,
	PLAYTIME_CONSTRAINTS,
	REVIEW_CONSTRAINTS,
} from '../constants/modifierConstraints';

type ModifierKey = 'criticalBonus' | 'bonus' | 'penalty' | 'criticalPenalty';

const MODIFIER_ORDER: ModifierKey[] = ['criticalBonus', 'bonus', 'penalty', 'criticalPenalty'];

const POSITIVE_EFFECT_KEYS: Set<ModifierKey> = new Set(['criticalBonus', 'bonus']);

const MODIFIER_LABELS: Record<ModifierKey, string> = {
	criticalBonus: 'Critical Bonus',
	bonus: 'Bonus',
	penalty: 'Penalty',
	criticalPenalty: 'Critical Penalty',
};

function hasExpectedEffectDirection(key: ModifierKey, effect: number): boolean {
	if (POSITIVE_EFFECT_KEYS.has(key)) {
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
	return getValidationErrors(config, constraints).length === 0;
}

type ActiveModifier = ReturnType<typeof getActiveModifiersInOrder>[number];

function getSingleModifierErrors(
	{ key, modifier }: ActiveModifier,
	constraints: ModifierConstraints
): string[] {
	const { threshold, effect } = modifier;
	const label = MODIFIER_LABELS[key];
	const errors: string[] = [];

	if (threshold < constraints.threshold.min || threshold > constraints.threshold.max) {
		errors.push(
			`${label} threshold must be between ${constraints.threshold.min} and ${constraints.threshold.max}`
		);
	}

	if (!hasExpectedEffectDirection(key, effect)) {
		const direction = POSITIVE_EFFECT_KEYS.has(key) ? 'positive' : 'negative';
		errors.push(`${label} effect must be ${direction}`);
	}

	if (!isEffectWithinRange(effect)) {
		errors.push(`${label} effect must be between -${MAX_EFFECT_SHIFT} and +${MAX_EFFECT_SHIFT}`);
	}

	return errors;
}

function getOrderingErrors(
	prev: ActiveModifier,
	current: ActiveModifier,
	constraints: ModifierConstraints
): string[] {
	const prevLabel = MODIFIER_LABELS[prev.key];
	const label = MODIFIER_LABELS[current.key];
	const errors: string[] = [];

	if (prev.modifier.threshold - current.modifier.threshold < constraints.threshold.step) {
		errors.push(`${prevLabel} threshold must be higher than ${label} threshold`);
	}

	if (prev.modifier.effect - current.modifier.effect < constraints.effect.step) {
		errors.push(`${prevLabel} effect must be greater than ${label} effect`);
	}

	return errors;
}

function getValidationErrors(config: ModifierConfig, constraints: ModifierConstraints): string[] {
	const activeModifiers = getActiveModifiersInOrder(config);

	return activeModifiers.flatMap((current, i) => [
		...getSingleModifierErrors(current, constraints),
		...(i > 0 ? getOrderingErrors(activeModifiers[i - 1], current, constraints) : []),
	]);
}

export function validatePlaytimeModifiers(config: ModifierConfig): boolean {
	return validateModifiers(config, PLAYTIME_CONSTRAINTS);
}

export function getPlaytimeValidationErrors(config: ModifierConfig): string[] {
	return getValidationErrors(config, PLAYTIME_CONSTRAINTS);
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

export function getReviewValidationErrors(config: ModifierConfig): string[] {
	return getValidationErrors(config, REVIEW_CONSTRAINTS);
}
