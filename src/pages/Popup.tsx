import './Popup.css';
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { getRaritySettings, updateRaritySettings } from '../services/SettingsService';
import { RaritySettings } from '../shared/types';
import browser from 'webextension-polyfill';
import { debug } from '../utils/debug';
import { STEAM_ORIGINS } from '../constants/steamOrigins';
import { STEAM_PERMISSION_INSTRUCTIONS } from '../constants/messages';
import CountrySelect from '../components/CountrySelect';
import ApiKeyInput from '../components/ApiKeyInput';

const VERSION = '1.1.3';
const GITHUB_URL = 'https://github.com/BDS-001/LootScout';
const FALLBACK_PERMISSION_ERROR =
	'Could not confirm Steam permissions. Grant access from the extension menu to enable enhancements.';

export default function Popup() {
	const [raritySettings, setRaritySettings] = useState<RaritySettings>({
		includePlaytime: false,
		includeReviewScore: false,
	});
	const [permissionWarning, setPermissionWarning] = useState('');
	const [hasSteamPermission, setHasSteamPermission] = useState<boolean | null>(null);
	const [isRequestingPermission, setIsRequestingPermission] = useState(false);
	const isMountedRef = useRef(true);

	useEffect(() => {
		const loadInitialSettings = async () => {
			try {
				const settings = await getRaritySettings();

				if (!isMountedRef.current) {
					return;
				}

				setRaritySettings(settings);
			} catch (error) {
				debug.error(error);
			}
		};

		void loadInitialSettings();
	}, []);

	useEffect(
		() => () => {
			isMountedRef.current = false;
		},
		[]
	);

	useEffect(() => {
		const checkSteamPermission = async () => {
			try {
				const hasPermission = await browser.permissions.contains({ origins: STEAM_ORIGINS });
				if (!isMountedRef.current) {
					return;
				}

				setHasSteamPermission(hasPermission);
				setPermissionWarning(hasPermission ? '' : STEAM_PERMISSION_INSTRUCTIONS);
			} catch (error) {
				debug.error('Error checking Steam permissions', error);
				if (!isMountedRef.current) {
					return;
				}

				setHasSteamPermission(false);
				setPermissionWarning(FALLBACK_PERMISSION_ERROR);
			}
		};

		void checkSteamPermission();
	}, []);

	const requestSteamPermission = useCallback(async () => {
		if (isRequestingPermission) {
			return;
		}

		setIsRequestingPermission(true);
		try {
			const granted = await browser.permissions.request({ origins: STEAM_ORIGINS });

			if (!isMountedRef.current) {
				return;
			}

			setHasSteamPermission(granted);
			setPermissionWarning(granted ? '' : STEAM_PERMISSION_INSTRUCTIONS);
		} catch (error) {
			debug.error('Error requesting Steam permissions', error);
			if (!isMountedRef.current) {
				return;
			}

			setHasSteamPermission(false);
			setPermissionWarning(FALLBACK_PERMISSION_ERROR);
		} finally {
			if (isMountedRef.current) {
				setIsRequestingPermission(false);
			}
		}
	}, [isRequestingPermission]);

	useLayoutEffect(() => {
		const container = document.querySelector('.popup-container');

		if (!container || typeof ResizeObserver === 'undefined') {
			return;
		}

		const maxPopupHeight = 600;
		const updateSize = () => {
			const height = Math.min(container.scrollHeight, maxPopupHeight);
			const width = Math.max(container.scrollWidth, 320);

			if (typeof window.resizeTo === 'function') {
				window.resizeTo(width, height);
			}
		};

		updateSize();

		const observer = new ResizeObserver(updateSize);
		observer.observe(container);

		return () => {
			observer.disconnect();
		};
	}, []);

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
				{hasSteamPermission === null ? (
					<div className="settings-loading">Checking permissions...</div>
				) : hasSteamPermission ? (
					<>
						<div className="setting-item">
							<CountrySelect />
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
							<ApiKeyInput />
						</div>
					</>
				) : (
					<div className="settings-locked">
						<div className="permission-warning">
							{permissionWarning || STEAM_PERMISSION_INSTRUCTIONS}
						</div>
						<p className="settings-locked-description">
							Grant access to store.steampowered.com in the extension settings to unlock
							configuration options.
						</p>
						<div className="permission-actions">
							<button
								type="button"
								onClick={requestSteamPermission}
								disabled={isRequestingPermission}
								className="grant-permission-button"
							>
								{isRequestingPermission ? 'Requesting...' : 'Grant Steam Permission'}
							</button>
						</div>
					</div>
				)}
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
							browser.tabs.create({ url: browser.runtime.getURL('src/settings.html') });
						}}
						className="github-link"
					>
						Settings
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
