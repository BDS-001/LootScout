import './Popup.css';
import { useState, useEffect } from 'react';
import regionMap from '../constants/regionMap';
import { loadApiKey, validateAndSaveApiKey } from '../api/ApiKeyService';
import { getRegion, getRaritySettings, updateRaritySettings } from '../services/SettingsService';
import { RaritySettings } from '../shared/types';
import browser from 'webextension-polyfill';
import { debug } from '../utils/debug';

const VERSION = '1.1.1';
const GITHUB_URL = 'https://github.com/BDS-001/LootScout';

export default function Popup() {
	const [selectedCountry, setSelectedCountry] = useState('us');
	const [apiKey, setApiKey] = useState('');
	const [raritySettings, setRaritySettings] = useState<RaritySettings>({
		includePlaytime: false,
		includeReviewScore: false,
	});
	const [testStatus, setTestStatus] = useState('');
	const [isTestingKey, setIsTestingKey] = useState(false);

	useEffect(() => {
		Promise.all([getRegion(), loadApiKey(), getRaritySettings()])
			.then(([country, key, settings]) => {
				setSelectedCountry(country);
				if (key) setApiKey(key);
				setRaritySettings(settings);
			})
			.catch(debug.error);
	}, []);

	const testApiKey = async () => {
		setIsTestingKey(true);
		setTestStatus('Checking...');
		try {
			const result = await validateAndSaveApiKey(apiKey);
			setTestStatus(result.message);
		} catch {
			setTestStatus('Failed to verify API key');
		} finally {
			setIsTestingKey(false);
		}
	};

	const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const country = e.target.value;
		setSelectedCountry(country);
		try {
			await browser.runtime.sendMessage({
				action: 'updateCountryCode',
				countryCode: country,
			});
		} catch (error) {
			debug.error('Error updating country:', error);
		}
	};

	const togglePlaytime = (checked: boolean) => {
		setRaritySettings((prev) => ({ ...prev, includePlaytime: checked }));
		updateRaritySettings({ includePlaytime: checked });
	};

	const toggleReviewScore = (checked: boolean) => {
		setRaritySettings((prev) => ({ ...prev, includeReviewScore: checked }));
		updateRaritySettings({ includeReviewScore: checked });
	};

	return (
		<div className="popup-container">
			<div className="header">
				<img src="/icon/lootscout64.png" alt="LootScout" className="popup-icon" />
				<div className="header-text">
					<h1 className="popup-title">LootScout</h1>
					<p className="popup-description">
						Compares Steam prices with current & historical best deals - rated with 9 rarity levels
					</p>
				</div>
			</div>

			<div className="settings-section">
				<div className="setting-item">
					<label htmlFor="country-select" className="setting-label">
						Change Country
					</label>
					<select
						id="country-select"
						value={selectedCountry}
						onChange={handleCountryChange}
						className="country-select"
					>
						{Object.entries(regionMap).map(([code, info]) => (
							<option key={code} value={code}>
								{info.name} ({info.currency})
							</option>
						))}
					</select>
				</div>

				<div className="setting-item">
					<label className="setting-label">Rarity Modifiers</label>
					<p className="setting-description">
						Adjust how rarity is calculated by including additional factors
					</p>
					<div className="toggle-group">
						<div className="toggle-item">
							<label className="toggle-label">
								<input
									type="checkbox"
									checked={raritySettings.includePlaytime}
									onChange={(e) => togglePlaytime(e.target.checked)}
									className="toggle-checkbox"
								/>
								<span className="toggle-switch"></span>
								<span className="toggle-text">Include Playtime</span>
							</label>
						</div>
						<div className="toggle-item">
							<label className="toggle-label">
								<input
									type="checkbox"
									checked={raritySettings.includeReviewScore}
									onChange={(e) => toggleReviewScore(e.target.checked)}
									className="toggle-checkbox"
								/>
								<span className="toggle-switch"></span>
								<span className="toggle-text">Include Review Score</span>
							</label>
						</div>
					</div>
				</div>

				<div className="setting-item">
					<label htmlFor="api-key-input" className="setting-label">
						Add API Key (Optional)
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
