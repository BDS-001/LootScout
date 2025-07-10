import './Popup.css';
import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import regionMap from '../constants/regionMap';

export default function () {
	const [selectedCountry, setSelectedCountry] = useState<string>('us');

	useEffect(() => {
		const loadCurrentCountry = async () => {
			try {
				const result = await browser.storage.local.get('countryCode');
				if (result.countryCode) {
					setSelectedCountry(result.countryCode);
				}
			} catch (error) {
				console.error('Error loading country code:', error);
			}
		};
		loadCurrentCountry();
	}, []);

	const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newCountryCode = event.target.value;
		setSelectedCountry(newCountryCode);

		try {
			await browser.runtime.sendMessage({
				action: 'updateCountryCode',
				countryCode: newCountryCode,
			});
		} catch (error) {
			console.error('Error updating country code:', error);
		}
	};

	return (
		<div className="popup-container">
			<img src="/icon-with-shadow.svg" alt="LootScout" className="popup-icon" />
			<h1 className="popup-title">LootScout</h1>
			<p className="popup-description">Find the best deals across the web</p>

			<div className="country-selector">
				<label htmlFor="country-select">Region:</label>
				<select id="country-select" value={selectedCountry} onChange={handleCountryChange}>
					{Object.entries(regionMap).map(([code, info]) => (
						<option key={code} value={code}>
							{info.name} ({info.currency})
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
