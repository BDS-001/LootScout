import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/SettingsService';
import { debug } from '../utils/debug';
import type { ModifierSettings as ModifierSettingsType } from '../shared/types';
import {
	validatePlaytimeModifiers,
	validateReviewModifiers,
} from '../validators/modifierValidation';

export default function ModifierSettings() {
	const [modifierSettings, setModifierSettings] = useState<ModifierSettingsType | null>(null);
	const [validSettings, setValidSettings] = useState(true);

	useEffect(() => {
		const loadInitialSettings = async () => {
			try {
				const settings = await getSettings();
				setModifierSettings(settings.modifiers);
			} catch (error) {
				debug.error(error);
			}
		};
		void loadInitialSettings();
	}, []);

	useEffect(() => {
		if (modifierSettings)
			setValidSettings(
				validatePlaytimeModifiers(modifierSettings.playtime) &&
					validateReviewModifiers(modifierSettings.review)
			);
	}, [modifierSettings]);

	const togglePlaytime = (checked: boolean) => {
		setModifierSettings((prev) => {
			if (!prev) return prev;
			const updated = { ...prev, playtime: { ...prev.playtime, active: checked } };
			updateSettings({ modifiers: updated });
			return updated;
		});
	};

	const toggleReview = (checked: boolean) => {
		setModifierSettings((prev) => {
			if (!prev) return prev;
			const updated = { ...prev, review: { ...prev.review, active: checked } };
			updateSettings({ modifiers: updated });
			return updated;
		});
	};

	return (
		<div className="modifier-settings">
			<div className="modifier-settings-grid">
				<div className="modifier-section">
					<label className="toggle-label">
						<input
							type="checkbox"
							checked={modifierSettings?.playtime.active ?? true}
							onChange={(e) => togglePlaytime(e.target.checked)}
							className="toggle-checkbox"
						/>
						<span className="toggle-switch"></span>
						<span className="toggle-text">Include Playtime</span>
					</label>
					{/* Playtime settings */}
				</div>
				<div className="modifier-section">
					<label className="toggle-label">
						<input
							type="checkbox"
							checked={modifierSettings?.review.active ?? true}
							onChange={(e) => toggleReview(e.target.checked)}
							className="toggle-checkbox"
						/>
						<span className="toggle-switch"></span>
						<span className="toggle-text">Include Review Score</span>
					</label>
					{/* Review settings */}
				</div>
			</div>
		</div>
	);
}
