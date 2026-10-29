const DEBUG = import.meta.env.MODE === 'development' || import.meta.env.VITE_DEBUG === 'true';

export const debug = {
	log: (...args: unknown[]) => {
		if (DEBUG) {
			console.log('[LootScout]', ...args);
		}
	},
	warn: (...args: unknown[]) => {
		if (DEBUG) {
			console.warn('[LootScout]', ...args);
		}
	},
	error: (...args: unknown[]) => {
		if (DEBUG) {
			console.error('[LootScout]', ...args);
		}
	},
};
