import './Popup.css';
import { useState, useEffect } from 'react';
import regionMap from '../constants/regionMap';
import { loadApiKey, validateAndSaveApiKey } from '../api/apiKeyService';
import { loadCountryCode, updateCountryCode } from '../services/countryService';

export default function () {
	const [selectedCountry, setSelectedCountry] = useState<string>('us');
	const [apiKey, setApiKey] = useState<string>('');
	const [testStatus, setTestStatus] = useState<string>('');
	const [isTestingKey, setIsTestingKey] = useState<boolean>(false);

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const countryCode = await loadCountryCode();
				setSelectedCountry(countryCode);

				const savedApiKey = await loadApiKey();
				if (savedApiKey) {
					setApiKey(savedApiKey);
				}
			} catch (error) {
				console.error('Error loading settings:', error);
			}
		};
		loadSettings();
	}, []);

	const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newCountryCode = event.target.value;
		setSelectedCountry(newCountryCode);

		try {
			await updateCountryCode(newCountryCode);
		} catch (error) {
			console.error('Error updating country code:', error);
		}
	};

	const testApiKey = async () => {
		setIsTestingKey(true);
		setTestStatus('Checking...');

		try {
			const result = await validateAndSaveApiKey(apiKey);
			setTestStatus(result.message);
		} catch (error) {
			setTestStatus('Failed to verify API key');
		} finally {
			setIsTestingKey(false);
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

			<div className="api-key-section">
				<label htmlFor="api-key-input">API Key:</label>
				<div className="api-key-input-group">
					<input
						id="api-key-input"
						type="password"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="Enter your GG.deals API key"
						disabled={isTestingKey}
					/>
					<button onClick={testApiKey} disabled={isTestingKey} className="apply-button">
						Apply
					</button>
				</div>
				{testStatus && <p className="test-status">{testStatus}</p>}
			</div>
		</div>
	);
}
