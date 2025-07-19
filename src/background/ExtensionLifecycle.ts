import browser from 'webextension-polyfill';
import { getRegion } from '../services/SettingsService';

export class ExtensionLifecycle {
	public setupEventListeners(): void {
		browser.runtime.onInstalled.addListener(async (details) => {
			console.log('Extension installed:', details);

			if (details.reason === 'install') {
				await getRegion();
			}
		});
	}
}
