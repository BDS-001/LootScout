const DEBUG = import.meta.env.MODE === 'development' || import.meta.env.VITE_DEBUG === 'true';

export const debug = {
	log: (...args: any[]) => {
		if (DEBUG) {
			console.log('[LootScout]', ...args);
		}
	},
	warn: (...args: any[]) => {
		if (DEBUG) {
			console.warn('[LootScout]', ...args);
		}
	},
	error: (...args: any[]) => {
		if (DEBUG) {
			console.error('[LootScout]', ...args);
		}
	},
};
