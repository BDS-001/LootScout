import browser from 'webextension-polyfill';
import { loadCountryCode } from '../services/CountryService';

export class ExtensionLifecycle {
	public setupEventListeners(): void {
		browser.runtime.onInstalled.addListener(async (details) => {
			console.log('Extension installed:', details);

			if (details.reason === 'install') {
				await loadCountryCode();
			}
		});
	}
}
