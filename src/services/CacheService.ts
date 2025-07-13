import { getStorageItem, setStorageItem } from './StorageService';

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
