import './Popup.css';
import { useState, useEffect } from 'react';
import regionMap from '../constants/regionMap';
import { loadApiKey, validateAndSaveApiKey } from '../api/ApiKeyService';
import { getRegion, updateRegion } from '../services/SettingsService';
import { RegionCode } from '../shared/types';
import browser from 'webextension-polyfill';

const VERSION = '0.0.0';
const GITHUB_URL = 'https://github.com/BDS-001/LootScout';

const useSettings = () => {
	const [selectedCountry, setSelectedCountry] = useState<string>('us');
	const [apiKey, setApiKey] = useState<string>('');

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const [countryCode, savedApiKey] = await Promise.all([getRegion(), loadApiKey()]);
				setSelectedCountry(countryCode);
				if (savedApiKey) setApiKey(savedApiKey);
			} catch (error) {
				console.error('Error loading settings:', error);
			}
		};
		loadSettings();
	}, []);

	return { selectedCountry, setSelectedCountry, apiKey, setApiKey };
};

const useApiKeyValidation = (apiKey: string) => {
	const [testStatus, setTestStatus] = useState<string>('');
	const [isTestingKey, setIsTestingKey] = useState<boolean>(false);

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

	return { testStatus, isTestingKey, testApiKey };
};

const CountrySelector = ({
	selectedCountry,
	onChange,
}: {
	selectedCountry: string;
	onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) => (
	<div className="setting-item">
		<label htmlFor="country-select" className="setting-label">
			Change Country
		</label>
		<select
			id="country-select"
			value={selectedCountry}
			onChange={onChange}
			className="country-select"
		>
			{Object.entries(regionMap).map(([code, info]) => (
				<option key={code} value={code}>
					{info.name} ({info.currency})
				</option>
			))}
		</select>
	</div>
);

const ApiKeySection = ({
	apiKey,
	setApiKey,
	testStatus,
	isTestingKey,
	testApiKey,
}: {
	apiKey: string;
	setApiKey: (value: string) => void;
	testStatus: string;
	isTestingKey: boolean;
	testApiKey: () => void;
}) => (
	<div className="setting-item">
		<label htmlFor="api-key-input" className="setting-label">
			Add API Key
		</label>
		<p className="setting-description">
			Reduce rate limits by adding your own GG.deals API key (get one at gg.deals/api)
		</p>
		<div className="api-key-input-group">
			<input
				id="api-key-input"
				type="password"
				value={apiKey}
				onChange={(e) => setApiKey(e.target.value)}
				placeholder="Enter your GG.deals API key"
				disabled={isTestingKey}
				className="api-key-input"
			/>
			<button onClick={testApiKey} disabled={isTestingKey} className="apply-button">
				{isTestingKey ? 'Testing...' : 'Apply'}
			</button>
		</div>
		{testStatus && <p className="test-status">{testStatus}</p>}
	</div>
);

export default function Popup() {
	const { selectedCountry, setSelectedCountry, apiKey, setApiKey } = useSettings();
	const { testStatus, isTestingKey, testApiKey } = useApiKeyValidation(apiKey);

	const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newCountryCode = event.target.value;
		setSelectedCountry(newCountryCode);

		try {
			await updateRegion(newCountryCode as RegionCode);
		} catch (error) {
			console.error('Error updating country code:', error);
		}
	};

	return (
		<div className="popup-container">
			<div className="header">
				<img src="/icon/lootscout64.png" alt="LootScout" className="popup-icon" />
				<div className="header-text">
					<h1 className="popup-title">LootScout</h1>
					<p className="popup-description">
						Compares Steam prices with current & historical best deals - rated with 8 rarity levels
					</p>
				</div>
			</div>

			<div className="settings-section">
				<CountrySelector selectedCountry={selectedCountry} onChange={handleCountryChange} />
				<ApiKeySection
					apiKey={apiKey}
					setApiKey={setApiKey}
					testStatus={testStatus}
					isTestingKey={isTestingKey}
					testApiKey={testApiKey}
				/>
			</div>

			<div className="footer">
				<div className="footer-links">
					<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="github-link">
						Source Code
					</a>
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							browser.tabs.create({ url: browser.runtime.getURL('src/about.html') });
						}}
						className="github-link"
					>
						About
					</a>
					<span className="version">v{VERSION}</span>
				</div>
			</div>
		</div>
	);
}
