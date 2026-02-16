import './Settings.css';
import CountrySelect from '../components/CountrySelect';

export default function Settings() {
	return (
		<div className="settings-page">
			<div className="settings-header">
				<img src="/icon/lootscout64.png" alt="LootScout" className="settings-icon" />
				<h1 className="settings-title">LootScout Settings</h1>
			</div>

			<div className="settings-section">
				<CountrySelect />
			</div>

			<div className="settings-section">
				<h2 className="settings-section-title">Rarity Modifiers</h2>
				<p className="settings-section-description">
					Adjust how rarity is calculated by including additional factors.
				</p>
			</div>

			<div className="settings-section">
				<h2 className="settings-section-title">API Key</h2>
				<p className="settings-section-description">
					Reduce rate limits by adding your own GG.deals API key.
				</p>
			</div>
		</div>
	);
}
