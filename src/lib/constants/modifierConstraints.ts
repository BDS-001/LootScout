export interface FieldConstraint {
	min: number;
	max: number;
	step: number;
}

export interface ModifierConstraints {
	threshold: FieldConstraint;
	effect: FieldConstraint;
}

export const PLAYTIME_CONSTRAINTS: ModifierConstraints = {
	threshold: { min: 0, max: Infinity, step: 1 },
	effect: { min: -4, max: 4, step: 1 },
};

export const REVIEW_CONSTRAINTS: ModifierConstraints = {
	threshold: { min: 1, max: 9, step: 1 },
	effect: { min: -4, max: 4, step: 1 },
};
