import browser from 'webextension-polyfill';
import { updateCountryCode, loadCountryCode } from '../services/countryService';
import { DataCoordinator } from './dataCoordinator';

export class MessageRouter {
	private dataCoordinator: DataCoordinator;

	constructor() {
		this.dataCoordinator = new DataCoordinator();
	}

	public setupEventListeners(): void {
		browser.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
			if (msg.action === 'updateCountryCode') {
				return this.handleUpdateCountryCode(msg.countryCode);
			} else if (msg.action === 'getAppData') {
				return this.dataCoordinator.fetchGameData(msg.appId);
			} else if (msg.action === 'getCountryCode') {
				return this.handleGetCountryCode();
			}
		});
	}

	private async handleUpdateCountryCode(
		countryCode: string
	): Promise<{ success: boolean; error?: any }> {
		try {
			await updateCountryCode(countryCode);
			console.log('Updated country code:', countryCode);
			return { success: true };
		} catch (error) {
			console.error('Error updating country code:', error);
			return { success: false, error: error };
		}
	}

	private async handleGetCountryCode(): Promise<string> {
		return await loadCountryCode();
	}
}
