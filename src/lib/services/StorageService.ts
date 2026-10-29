import browser from 'webextension-polyfill';
import { debug } from '../utils/debug';

export type TypeGuard<T> = (value: unknown) => value is T;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const getStorageItem = async <T>(key: string, guard: TypeGuard<T>): Promise<T | null> => {
	try {
		const result = await browser.storage.local.get(key);
		const value: unknown = result[key];
		return guard(value) ? value : null;
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

export const getMultipleStorageItems = async (keys: string[]): Promise<Record<string, unknown>> => {
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
