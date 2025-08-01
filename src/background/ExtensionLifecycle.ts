import browser from 'webextension-polyfill';
import { getRegion } from '../services/SettingsService';
import { debug } from '../utils/debug';

export class ExtensionLifecycle {
	public setupEventListeners(): void {
		browser.runtime.onInstalled.addListener(async (details) => {
			debug.log('Extension installed:', details);

			if (details.reason === 'install') {
				await getRegion();
			}
		});
	}
}
