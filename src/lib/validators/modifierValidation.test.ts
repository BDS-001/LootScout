import { describe, it, expect } from 'vitest';
import { validatePlaytimeModifiers, validateReviewModifiers } from './modifierValidation';
import { DEFAULT_SETTINGS } from '../constants/defaultSettings';
import { MAX_EFFECT_SHIFT } from '../constants/modifierConstraints';
import { ModifierConfig } from '../shared/types';

const inactiveModifier = { effect: 0, threshold: 0, active: false };

function makeConfig(overrides: Partial<ModifierConfig> = {}): ModifierConfig {
	return {
		active: true,
		criticalBonus: inactiveModifier,
		bonus: inactiveModifier,
		penalty: inactiveModifier,
		criticalPenalty: inactiveModifier,
		...overrides,
	};
}

describe('validatePlaytimeModifiers', () => {
	it('accepts the default playtime config', () => {
		expect(validatePlaytimeModifiers(DEFAULT_SETTINGS.modifiers.playtime)).toBe(true);
	});

	it('accepts when all modifiers are inactive', () => {
		expect(validatePlaytimeModifiers(makeConfig())).toBe(true);
	});

	it('accepts a single active bonus', () => {
		const config = makeConfig({
			bonus: { effect: 1, threshold: 30, active: true },
		});
		expect(validatePlaytimeModifiers(config)).toBe(true);
	});

	it('accepts a single active penalty', () => {
		const config = makeConfig({
			penalty: { effect: -1, threshold: 5, active: true },
		});
		expect(validatePlaytimeModifiers(config)).toBe(true);
	});

	describe('threshold validation', () => {
		it('rejects negative threshold', () => {
			const config = makeConfig({
				bonus: { effect: 1, threshold: -1, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('accepts zero threshold', () => {
			const config = makeConfig({
				penalty: { effect: -1, threshold: 0, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(true);
		});

		it('accepts very large threshold', () => {
			const config = makeConfig({
				bonus: { effect: 1, threshold: 10000, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(true);
		});
	});

	describe('effect direction', () => {
		it('rejects negative effect on bonus', () => {
			const config = makeConfig({
				bonus: { effect: -1, threshold: 30, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('rejects zero effect on bonus', () => {
			const config = makeConfig({
				bonus: { effect: 0, threshold: 30, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('rejects positive effect on penalty', () => {
			const config = makeConfig({
				penalty: { effect: 1, threshold: 5, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('rejects zero effect on penalty', () => {
			const config = makeConfig({
				penalty: { effect: 0, threshold: 5, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('rejects negative effect on criticalBonus', () => {
			const config = makeConfig({
				criticalBonus: { effect: -1, threshold: 60, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('rejects positive effect on criticalPenalty', () => {
			const config = makeConfig({
				criticalPenalty: { effect: 1, threshold: 1, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});
	});

	describe('effect magnitude', () => {
		it('accepts effect at MAX_EFFECT_SHIFT', () => {
			const config = makeConfig({
				bonus: { effect: MAX_EFFECT_SHIFT, threshold: 60, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(true);
		});

		it('rejects effect exceeding MAX_EFFECT_SHIFT', () => {
			const config = makeConfig({
				bonus: { effect: MAX_EFFECT_SHIFT + 1, threshold: 60, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('rejects negative effect exceeding MAX_EFFECT_SHIFT', () => {
			const config = makeConfig({
				penalty: { effect: -(MAX_EFFECT_SHIFT + 1), threshold: 5, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});
	});

	describe('adjacent modifier ordering', () => {
		it('accepts descending thresholds with sufficient step', () => {
			const config = makeConfig({
				bonus: { effect: 1, threshold: 30, active: true },
				penalty: { effect: -1, threshold: 5, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(true);
		});

		it('rejects equal thresholds between adjacent modifiers', () => {
			const config = makeConfig({
				bonus: { effect: 1, threshold: 10, active: true },
				penalty: { effect: -1, threshold: 10, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('rejects ascending thresholds', () => {
			const config = makeConfig({
				bonus: { effect: 1, threshold: 5, active: true },
				penalty: { effect: -1, threshold: 30, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('rejects insufficient effect step between adjacent modifiers', () => {
			const config = makeConfig({
				bonus: { effect: 1, threshold: 30, active: true },
				penalty: { effect: 1, threshold: 5, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});

		it('accepts all four tiers with valid descending order', () => {
			const config: ModifierConfig = {
				active: true,
				criticalBonus: { effect: 3, threshold: 100, active: true },
				bonus: { effect: 1, threshold: 30, active: true },
				penalty: { effect: -1, threshold: 10, active: true },
				criticalPenalty: { effect: -3, threshold: 2, active: true },
			};
			expect(validatePlaytimeModifiers(config)).toBe(true);
		});

		it('skips inactive modifiers in ordering checks', () => {
			const config = makeConfig({
				criticalBonus: { effect: 2, threshold: 60, active: true },
				// bonus inactive - skipped
				penalty: { effect: -1, threshold: 5, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(true);
		});

		it('rejects threshold step of exactly 0 between non-adjacent active tiers', () => {
			const config = makeConfig({
				criticalBonus: { effect: 2, threshold: 5, active: true },
				// bonus inactive
				penalty: { effect: -1, threshold: 5, active: true },
			});
			expect(validatePlaytimeModifiers(config)).toBe(false);
		});
	});
});

describe('validateReviewModifiers', () => {
	it('accepts the default review config', () => {
		expect(validateReviewModifiers(DEFAULT_SETTINGS.modifiers.review)).toBe(true);
	});

	it('accepts when all modifiers are inactive', () => {
		expect(validateReviewModifiers(makeConfig())).toBe(true);
	});

	describe('review threshold bounds (1-9)', () => {
		it('rejects threshold below 1', () => {
			const config = makeConfig({
				bonus: { effect: 1, threshold: 0, active: true },
			});
			expect(validateReviewModifiers(config)).toBe(false);
		});

		it('accepts threshold at minimum (1)', () => {
			const config = makeConfig({
				penalty: { effect: -1, threshold: 1, active: true },
			});
			expect(validateReviewModifiers(config)).toBe(true);
		});

		it('accepts threshold at maximum (9)', () => {
			const config = makeConfig({
				bonus: { effect: 1, threshold: 9, active: true },
			});
			expect(validateReviewModifiers(config)).toBe(true);
		});

		it('rejects threshold above 9', () => {
			const config = makeConfig({
				bonus: { effect: 1, threshold: 10, active: true },
			});
			expect(validateReviewModifiers(config)).toBe(false);
		});
	});

	it('accepts valid multi-tier review config', () => {
		const config: ModifierConfig = {
			active: true,
			criticalBonus: { effect: 2, threshold: 9, active: true },
			bonus: { effect: 1, threshold: 7, active: true },
			penalty: { effect: -1, threshold: 4, active: true },
			criticalPenalty: { effect: -2, threshold: 2, active: true },
		};
		expect(validateReviewModifiers(config)).toBe(true);
	});

	it('rejects when thresholds are too close for step requirement', () => {
		const config = makeConfig({
			bonus: { effect: 1, threshold: 5, active: true },
			penalty: { effect: -1, threshold: 5, active: true },
		});
		expect(validateReviewModifiers(config)).toBe(false);
	});
});
