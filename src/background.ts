import { MessageRouter } from './background/MessageRouter';
import { AlarmManager } from './background/AlarmHandler';
import { getRegion } from './services/SettingsService';
import { debug } from './utils/debug';
import browser from 'webextension-polyfill';

debug.log('Background script initialized');
browser.runtime.onInstalled.addListener(async (details) => {
	debug.log('Extension installed:', details);
	if (details.reason === 'install') {
		await getRegion();
	}
});

const messageRouter = new MessageRouter();
messageRouter.setupEventListeners();

const alarmManager = new AlarmManager();
alarmManager.initialize();
