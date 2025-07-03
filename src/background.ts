import browser from "webextension-polyfill";

async function parseSteamAppId() {
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const pattern = /store.steampowered.com\/app\/(?<appId>\d+)/
    const match = tab.url?.match(pattern)
    const appId = match?.groups?.appId
    console.log(appId)
  } catch (error) {
    return null
  }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('message recieved')
  if (message.type === 'STEAM_STORE_PAGE_LAODED') {
    console.log('steam game page')
      const appId = parseSteamAppId()
    }
});
