import fetchGameData from './api/ggDealsApi';
import parseSteamPageUrl from './util/steamAppIdParser';

async function handleContentProcesing(): Promise<void> {
	const { appId, appName } = parseSteamPageUrl();
	const apiKey = import.meta.env.VITE_GG_API_KEY; //temp env variable implementation

	if (appId && apiKey) {
		const response = await fetchGameData(appId, apiKey);
		console.log(response);
	}
}

// Entry Point
if (window.location.href.includes('store.steampowered.com/app/')) {
	handleContentProcesing();
}
