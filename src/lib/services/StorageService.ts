import browser from 'webextension-polyfill';
import { debug } from '../utils/debug';

export const getStorageItem = async <T>(key: string): Promise<T | null> => {
	try {
		const result = await browser.storage.local.get(key);
		return result[key] || null;
	} catch (error) {
		debug.error(`Error getting storage item ${key}:`, error);
		return null;
	}
};

export const setStorageItem = async <T>(key: string, value: T): Promise<void> => {
	try {
		await browser.storage.local.set({ [key]: value });
	} catch (error) {
		debug.error(`Error setting storage item ${key}:`, error);
		throw error;
	}
};

export const getMultipleStorageItems = async (keys: string[]): Promise<Record<string, any>> => {
	try {
		return await browser.storage.local.get(keys);
	} catch (error) {
		debug.error('Error getting multiple storage items:', error);
		return {};
	}
};

export const removeStorageItem = async (key: string): Promise<void> => {
	try {
		await browser.storage.local.remove(key);
	} catch (error) {
		debug.error(`Error removing storage item ${key}:`, error);
		throw error;
	}
};
