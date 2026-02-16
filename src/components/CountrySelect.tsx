import { useState, useEffect, useRef } from 'react';
import regionMap from '../constants/regionMap';
import { getRegion } from '../services/SettingsService';
import { debug } from '../utils/debug';
import browser from 'webextension-polyfill';
import './CountrySelect.css';

export default function CountrySelect() {
	const [selectedCountry, setSelectedCountry] = useState('us');
	const initialCountry = useRef<string>();

	useEffect(() => {
		const loadRegion = async () => {
			try {
				const country = await getRegion();
				setSelectedCountry(country);
				initialCountry.current = country;
			} catch (error) {
				debug.error('Error loading region:', error);
			}
		};
		void loadRegion();
	}, []);

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

	const hasChanged = initialCountry.current && selectedCountry !== initialCountry.current;

	return (
		<div>
			<label htmlFor="country-select" className="country-select-label">
				Change Country{' '}
				{hasChanged && (
					<>
						- <span className="reload-hint">reload page to update</span>
					</>
				)}
			</label>
			<select
				id="country-select"
				value={selectedCountry}
				onChange={handleCountryChange}
				className="form-input country-select"
			>
				{Object.entries(regionMap).map(([code, info]) => (
					<option key={code} value={code}>
						{info.name} ({info.currency})
					</option>
				))}
			</select>
		</div>
	);
}
