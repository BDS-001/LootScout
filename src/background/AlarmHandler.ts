import { cleanupExpiredCache } from '../services/CacheService';
import { debug } from '../utils/debug';
import browser from 'webextension-polyfill';

export class AlarmManager {
	async performCacheCleanup() {
		try {
			const cleanedCount = await cleanupExpiredCache();
			if (cleanedCount > 0) {
				debug.log(`Cache cleanup: removed ${cleanedCount} expired items`);
			}
		} catch (error) {
			debug.error('Cache cleanup failed:', error);
		}
	}

	initialize() {
		this.performCacheCleanup();
		browser.alarms.create('cache-cleanup', {
			delayInMinutes: 120,
			periodInMinutes: 120,
		});
		this.setupEventListeners();
	}

	setupEventListeners() {
		browser.runtime.onStartup.addListener(() => {
			this.performCacheCleanup();
		});

		browser.alarms.onAlarm.addListener((alarm) => {
			if (alarm.name === 'cache-cleanup') {
				this.performCacheCleanup();
			}
		});
	}
}
