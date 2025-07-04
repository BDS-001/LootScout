import { useEffect } from 'react';
import './Popup.css';

async function getTabUrl() {
	try {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		return tab.url;
	} catch (error) {
		return null;
	}
}

export default function () {
	useEffect(() => {
		console.log('Hello from the popup!');
		const getUrl = async () => {
			const url = await getTabUrl();
			console.log(`URL: ${url}`);
		};

		getUrl();
	}, []);

	return (
		<div>
			<img src="/icon-with-shadow.svg" />
			<h1>vite-plugin-web-extension</h1>
			<p>
				Template: <code>react-ts</code>
			</p>
		</div>
	);
}
