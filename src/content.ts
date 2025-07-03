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
  
    if (appId) {
        console.log(appId)
    }

    if (appName) {
        console.log(appName)
    }
}