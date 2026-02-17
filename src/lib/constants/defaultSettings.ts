import { AppSettings } from '../shared/types';
import { DEFAULT_REGION } from './regionMap';

export const DEFAULT_SETTINGS: AppSettings = {
	region: DEFAULT_REGION,
	apiKey: '',
	modifiers: {
		playtime: {
			active: true,
			criticalBonus: { effect: 2, threshold: 60, active: true },
			bonus: { effect: 1, threshold: 30, active: true },
			penalty: { effect: -1, threshold: 5, active: true },
			criticalPenalty: { effect: 0, threshold: 0, active: false },
		},
		review: {
			active: true,
			criticalBonus: { effect: 0, threshold: 0, active: false },
			bonus: { effect: 1, threshold: 9, active: true },
			penalty: { effect: -1, threshold: 4, active: true },
			criticalPenalty: { effect: -2, threshold: 1, active: true },
		},
	},
};
