import browser from 'webextension-polyfill';
import { parseSteamCountryCode } from '../parsers/steamLanguageParser';
import { isValidCountryCode } from '../services/countryService';
import { setStorageItem } from '../services/storageService';

export class ExtensionLifecycle {
	private async initializeCountryCode(): Promise<void> {
		try {
			const cookie = await browser.cookies.get({
				url: 'https://store.steampowered.com',
				name: 'steamCountry',
			});

			const countryCode = parseSteamCountryCode(cookie?.value);

			if (isValidCountryCode(countryCode)) {
				await setStorageItem('countryCode', countryCode);
				console.log('Saved country code:', countryCode);
			} else {
				console.log('Invalid country code, using default');
				await setStorageItem('countryCode', 'us');
			}
		} catch (error) {
			console.log('Could not detect Steam country, using default:', error);
			await setStorageItem('countryCode', 'us');
		}
	}

	public setupEventListeners(): void {
		browser.runtime.onInstalled.addListener(async (details) => {
			console.log('Extension installed:', details);

			if (details.reason === 'install') {
				await this.initializeCountryCode();
			}
		});
	}
}
