import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRarity, getRarityAnalysis } from './getRarity';
import * as SettingsService from '../services/SettingsService';
import { RARITY_CHART } from '../constants/rarityChart';
import { PLAYTIME_THRESHOLDS, REVIEW_THRESHOLDS } from '../constants/modifiers';

// Mock the settings service
vi.mock('../services/SettingsService', () => ({
	getRaritySettings: vi.fn(),
}));

const mockGetRaritySettings = vi.mocked(SettingsService.getRaritySettings);

// Test constants - derive from actual constants to reduce brittleness
const TEST_SCENARIOS = {
	discounts: {
		minimal: 5,
		low: 20,
		medium: 35,
		high: 50,
		veryHigh: 70,
		extreme: 85,
		nearPerfect: 95,
		perfect: 100,
	},
	reviews: {
		terrible: REVIEW_THRESHOLDS.CRITICAL_PENALTY,
		poor: REVIEW_THRESHOLDS.PENALTY,
		neutral: 6,
		excellent: REVIEW_THRESHOLDS.BONUS,
	},
	playtime: {
		minimal: PLAYTIME_THRESHOLDS.PENALTY,
		normal: 15,
		good: PLAYTIME_THRESHOLDS.BONUS,
		exceptional: PLAYTIME_THRESHOLDS.CRITICAL_BONUS,
	},
};

describe('getRarity', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetRaritySettings.mockResolvedValue({
			includeReviewScore: true,
			includePlaytime: true,
		});
	});

	describe('basic discount tiers', () => {
		it.each([
			[0, 'Common'],
			[14, 'Common'],
			[15, 'Uncommon'],
			[29, 'Uncommon'],
			[30, 'Rare'],
			[44, 'Rare'],
			[45, 'Epic'],
			[59, 'Epic'],
			[60, 'Legendary'],
			[79, 'Legendary'],
			[80, 'Mythic'],
			[89, 'Mythic'],
			[90, 'Exotic'],
			[99, 'Exotic'],
			[100, 'Iridescent'],
			[150, 'Iridescent'],
		])('should return %s for %i% discount', async (discount, expected) => {
			expect(await getRarity(discount)).toBe(expected);
		});
	});

	describe('review score impact', () => {
		const baseDiscount = TEST_SCENARIOS.discounts.medium;

		it('should improve rarity with excellent reviews', async () => {
			const withoutReview = await getRarity(baseDiscount);
			const withReview = await getRarity(baseDiscount, TEST_SCENARIOS.reviews.excellent);

			const withoutIndex = RARITY_CHART.findIndex((r) => r.name === withoutReview);
			const withIndex = RARITY_CHART.findIndex((r) => r.name === withReview);

			expect(withIndex).toBeGreaterThan(withoutIndex);
		});

		it('should worsen rarity with poor reviews', async () => {
			const withoutReview = await getRarity(baseDiscount);
			const withReview = await getRarity(baseDiscount, TEST_SCENARIOS.reviews.poor);

			const withoutIndex = RARITY_CHART.findIndex((r) => r.name === withoutReview);
			const withIndex = RARITY_CHART.findIndex((r) => r.name === withReview);

			expect(withIndex).toBeLessThan(withoutIndex);
		});

		it('should severely worsen rarity with terrible reviews', async () => {
			const withoutReview = await getRarity(baseDiscount);
			const withReview = await getRarity(baseDiscount, TEST_SCENARIOS.reviews.terrible);

			const withoutIndex = RARITY_CHART.findIndex((r) => r.name === withoutReview);
			const withIndex = RARITY_CHART.findIndex((r) => r.name === withReview);

			expect(withIndex).toBeLessThanOrEqual(withoutIndex - 2);
		});

		it('should not change rarity with neutral reviews', async () => {
			const withoutReview = await getRarity(baseDiscount);
			const withReview = await getRarity(baseDiscount, TEST_SCENARIOS.reviews.neutral);

			expect(withReview).toBe(withoutReview);
		});

		it('should ignore reviews when disabled', async () => {
			mockGetRaritySettings.mockResolvedValue({
				includeReviewScore: false,
				includePlaytime: true,
			});

			const withoutReview = await getRarity(baseDiscount);
			const withReview = await getRarity(baseDiscount, TEST_SCENARIOS.reviews.excellent);

			expect(withReview).toBe(withoutReview);
		});
	});

	describe('playtime impact', () => {
		const baseDiscount = TEST_SCENARIOS.discounts.low;

		it('should significantly improve rarity with exceptional playtime', async () => {
			const withoutPlaytime = await getRarity(baseDiscount);
			const withPlaytime = await getRarity(baseDiscount, null, TEST_SCENARIOS.playtime.exceptional);

			const withoutIndex = RARITY_CHART.findIndex((r) => r.name === withoutPlaytime);
			const withIndex = RARITY_CHART.findIndex((r) => r.name === withPlaytime);

			expect(withIndex).toBeGreaterThanOrEqual(withoutIndex + 2);
		});

		it('should improve rarity with good playtime', async () => {
			const withoutPlaytime = await getRarity(baseDiscount);
			const withPlaytime = await getRarity(baseDiscount, null, TEST_SCENARIOS.playtime.good);

			const withoutIndex = RARITY_CHART.findIndex((r) => r.name === withoutPlaytime);
			const withIndex = RARITY_CHART.findIndex((r) => r.name === withPlaytime);

			expect(withIndex).toBeGreaterThan(withoutIndex);
		});

		it('should worsen rarity with minimal playtime', async () => {
			const withoutPlaytime = await getRarity(baseDiscount);
			const withPlaytime = await getRarity(baseDiscount, null, TEST_SCENARIOS.playtime.minimal);

			const withoutIndex = RARITY_CHART.findIndex((r) => r.name === withoutPlaytime);
			const withIndex = RARITY_CHART.findIndex((r) => r.name === withPlaytime);

			expect(withIndex).toBeLessThan(withoutIndex);
		});

		it('should ignore invalid playtime values', async () => {
			const baseline = await getRarity(baseDiscount);

			expect(await getRarity(baseDiscount, null, null)).toBe(baseline);
			expect(await getRarity(baseDiscount, null, -1)).toBe(baseline);
		});

		it('should ignore playtime when disabled', async () => {
			mockGetRaritySettings.mockResolvedValue({
				includeReviewScore: true,
				includePlaytime: false,
			});

			const withoutPlaytime = await getRarity(baseDiscount);
			const withPlaytime = await getRarity(baseDiscount, null, TEST_SCENARIOS.playtime.exceptional);

			expect(withPlaytime).toBe(withoutPlaytime);
		});
	});

	describe('combined effects', () => {
		it('should stack positive modifiers', async () => {
			const baseline = await getRarity(TEST_SCENARIOS.discounts.low);
			const combined = await getRarity(
				TEST_SCENARIOS.discounts.low,
				TEST_SCENARIOS.reviews.excellent,
				TEST_SCENARIOS.playtime.exceptional
			);

			const baselineIndex = RARITY_CHART.findIndex((r) => r.name === baseline);
			const combinedIndex = RARITY_CHART.findIndex((r) => r.name === combined);

			expect(combinedIndex).toBeGreaterThan(baselineIndex + 2);
		});

		it('should stack negative modifiers', async () => {
			const baseline = await getRarity(TEST_SCENARIOS.discounts.high);
			const combined = await getRarity(
				TEST_SCENARIOS.discounts.high,
				TEST_SCENARIOS.reviews.terrible,
				TEST_SCENARIOS.playtime.minimal
			);

			const baselineIndex = RARITY_CHART.findIndex((r) => r.name === baseline);
			const combinedIndex = RARITY_CHART.findIndex((r) => r.name === combined);

			expect(combinedIndex).toBeLessThan(baselineIndex - 2);
		});
	});

	describe('edge cases', () => {
		it('should not go below Common tier', async () => {
			const result = await getRarity(
				0,
				TEST_SCENARIOS.reviews.terrible,
				TEST_SCENARIOS.playtime.minimal
			);
			expect(result).toBe('Common');
		});

		it('should cap at Exotic tier (excluding Iridescent)', async () => {
			const result = await getRarity(
				TEST_SCENARIOS.discounts.extreme,
				TEST_SCENARIOS.reviews.excellent,
				TEST_SCENARIOS.playtime.exceptional
			);
			const resultIndex = RARITY_CHART.findIndex((r) => r.name === result);
			expect(resultIndex).toBeLessThanOrEqual(6);
		});

		it('should always return Iridescent for 100%+ regardless of modifiers', async () => {
			expect(
				await getRarity(100, TEST_SCENARIOS.reviews.terrible, TEST_SCENARIOS.playtime.minimal)
			).toBe('Iridescent');
			expect(
				await getRarity(100, TEST_SCENARIOS.reviews.excellent, TEST_SCENARIOS.playtime.exceptional)
			).toBe('Iridescent');
		});
	});
});

describe('getRarityAnalysis', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetRaritySettings.mockResolvedValue({
			includeReviewScore: true,
			includePlaytime: true,
		});
	});

	it('should provide detailed breakdown for basic discount', async () => {
		const analysis = await getRarityAnalysis(TEST_SCENARIOS.discounts.medium);

		expect(analysis.name).toBe('Rare'); // Business expectation
		expect(analysis.reviewBonus).toBe(0);
		expect(analysis.playtimeBonus).toBe(0);
		expect(analysis.finalScore).toBe(analysis.baseScore);
		expect(analysis.reviewScoreUsed).toBe(true);
		expect(analysis.playtimeUsed).toBe(true);
	});

	it('should track modifier usage based on settings', async () => {
		mockGetRaritySettings.mockResolvedValue({
			includeReviewScore: false,
			includePlaytime: true,
		});

		const analysis = await getRarityAnalysis(
			TEST_SCENARIOS.discounts.medium,
			TEST_SCENARIOS.reviews.excellent,
			TEST_SCENARIOS.playtime.exceptional
		);

		expect(analysis.reviewScoreUsed).toBe(false);
		expect(analysis.playtimeUsed).toBe(true);
		expect(analysis.reviewBonus).toBe(0); // Should be ignored
		expect(analysis.playtimeBonus).toBeGreaterThan(0); // Should be applied
	});

	it('should handle Iridescent special case', async () => {
		const analysis = await getRarityAnalysis(100);

		expect(analysis.name).toBe('Iridescent');
		expect(analysis.reviewBonus).toBe(0);
		expect(analysis.playtimeBonus).toBe(0);
		expect(analysis.reviewScoreUsed).toBe(false);
		expect(analysis.playtimeUsed).toBe(false);
	});
});
