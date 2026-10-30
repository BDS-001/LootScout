import { MessageRouter } from './MessageRouter';
import { AlarmManager } from './AlarmHandler';
import { getRegion } from '../lib/services/SettingsService';
import { debug } from '../lib/utils/debug';
import browser from 'webextension-polyfill';
import { STEAM_ORIGINS } from '../lib/constants/steamOrigins';

const updatePermissionBadge = async (): Promise<void> => {
	try {
		const hasPermission = await browser.permissions.contains({ origins: STEAM_ORIGINS });
		await browser.action.setBadgeText({ text: hasPermission ? '' : '!' });
		if (!hasPermission) {
			await browser.action.setBadgeBackgroundColor({ color: '#d9534f' });
		}
	} catch (error) {
		debug.error('Failed to update permission badge:', error);
	}
};

debug.log('Background script initialized');
browser.runtime.onInstalled.addListener(async (details) => {
	debug.log('Extension installed:', details);
	if (details.reason === 'install') {
		await getRegion();
	}
	await updatePermissionBadge();
});

browser.runtime.onStartup.addListener(() => void updatePermissionBadge());
browser.permissions.onAdded.addListener(() => void updatePermissionBadge());
browser.permissions.onRemoved.addListener(() => void updatePermissionBadge());

const messageRouter = new MessageRouter();
messageRouter.setupEventListeners();

const alarmManager = new AlarmManager();
alarmManager.initialize();
