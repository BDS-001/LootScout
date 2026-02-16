import { ModifierConfig } from '../shared/types';
import {
	ModifierConstraints,
	PLAYTIME_CONSTRAINTS,
	REVIEW_CONSTRAINTS,
} from '../constants/modifierConstraints';

export function validatePlaytimeModifiers(config: ModifierConfig): boolean {
	// TODO: add validation logic
	return true;
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
	// TODO: add validation logic
	return true;
}
