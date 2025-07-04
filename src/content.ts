interface SteamAppUrlData {
    appId: string | null,
    appName: string | null
}

function parseSteamPageUrl(): SteamAppUrlData {
    const pattern = /store\.steampowered\.com\/app\/(?<appId>\d+)\/(?<appName>[\w-]+)/
    const match = window.location.href.match(pattern)
    const appId = match?.groups?.appId || null
    const appName = match?.groups?.appName || null

    return {appId, appName}
}

if (window.location.href.includes('store.steampowered.com/app/')) {
    const {appId, appName} = parseSteamPageUrl()
    const apiKey = import.meta.env.VITE_GG_API_KEY

    if(appId && apiKey) setupContent(appId, apiKey)
}

async function setupContent(appId: string, apiKey:string): Promise<void> {
    const result = await fetch(`https://api.gg.deals/v1/prices/by-steam-app-id/?ids=${appId}&key=${apiKey}&region=ca`)
}