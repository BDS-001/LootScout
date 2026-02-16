import { useState, useEffect } from 'react';
import { loadApiKey, validateAndSaveApiKey, saveApiKey } from '../api/ApiKeyService';
import { debug } from '../utils/debug';
import './ApiKeyInput.css';

export default function ApiKeyInput() {
	const [apiKey, setApiKey] = useState('');
	const [hasSavedKey, setHasSavedKey] = useState(false);
	const [testStatus, setTestStatus] = useState('');
	const [isTestingKey, setIsTestingKey] = useState(false);
	const [confirmingRemove, setConfirmingRemove] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const key = await loadApiKey();
				if (key) {
					setApiKey(key);
					setHasSavedKey(true);
				}
			} catch (error) {
				debug.error('Error loading API key:', error);
			}
		};
		void load();
	}, []);

	const testApiKey = async () => {
		setIsTestingKey(true);
		setTestStatus('Checking...');
		try {
			const result = await validateAndSaveApiKey(apiKey);
			setTestStatus(result.message);
			if (result.success) {
				setHasSavedKey(true);
			}
		} catch {
			setTestStatus('Failed to verify API key');
		} finally {
			setIsTestingKey(false);
		}
	};

	const handleRemove = async () => {
		if (!confirmingRemove) {
			setConfirmingRemove(true);
			return;
		}
		await saveApiKey('');
		setApiKey('');
		setHasSavedKey(false);
		setConfirmingRemove(false);
		setTestStatus('');
	};

	if (hasSavedKey) {
		return (
			<div>
				<label className="api-key-label">API Key (Optional)</label>
				<p className="api-key-description">Your API key is active.</p>
				<button
					onClick={handleRemove}
					className={`api-key-remove-button ${confirmingRemove ? 'confirming' : ''}`}
				>
					{confirmingRemove ? 'Confirm Remove' : 'Remove API Key'}
				</button>
			</div>
		);
	}

	return (
		<div>
			<label htmlFor="api-key-input" className="api-key-label">
				Add API Key (Optional)
			</label>
			<p className="api-key-description">
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
					className="form-input api-key-input"
				/>
				<button onClick={testApiKey} disabled={isTestingKey} className="api-key-apply-button">
					{isTestingKey ? 'Testing...' : 'Apply'}
				</button>
			</div>
			{testStatus && <p className="api-key-test-status">{testStatus}</p>}
		</div>
	);
}
