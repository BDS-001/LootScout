import { getStorageItem, setStorageItem } from './StorageService';
import browser from 'webextension-polyfill';

const DEFAULT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const getCacheItem = async <T>(key: string): Promise<T | null> => {
	const cached = await getStorageItem<{ timestamp: number; data: T }>(key);
	return cached?.data || null;
};

export const getCacheItemWithExpiry = async <T>(
	key: string,
	maxAge: number = DEFAULT_CACHE_DURATION
): Promise<T | null> => {
	const cached = await getStorageItem<{ timestamp: number; data: T }>(key);

	if (!cached?.timestamp || !cached.data) {
		return null;
	}

	const cacheAge = Date.now() - cached.timestamp;
	if (cacheAge >= maxAge) {
		await clearCacheItem(key);
		return null;
	}

	return cached.data;
};

export const setCacheItem = async <T>(key: string, data: T): Promise<void> => {
	await setStorageItem(key, { timestamp: Date.now(), data });
};

export const clearCacheItem = async (key: string): Promise<void> => {
	await setStorageItem(key, null);
};

export const cleanupExpiredCache = async (): Promise<number> => {
	try {
		const storage = await browser.storage.local.get();
		let count = 0;
		const keysToRemove: string[] = [];

		for (const [key, value] of Object.entries(storage)) {
			if (value && typeof value === 'object' && 'timestamp' in value) {
				const { timestamp } = value;
				const age = Date.now() - timestamp;

				if (age >= DEFAULT_CACHE_DURATION) {
					keysToRemove.push(key);
					count++;
				}
			}
		}

		if (keysToRemove.length > 0) {
			await browser.storage.local.remove(keysToRemove);
		}

		return count;
	} catch (error) {
		console.error('Cache cleanup failed:', error);
		return 0;
	}
};
