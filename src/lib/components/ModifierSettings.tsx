import { useState, useEffect } from 'react';
import './ModifierSettings.css';
import { getSettings, updateSettings } from '../services/SettingsService';
import { DEFAULT_SETTINGS } from '../constants/defaultSettings';
import { debug } from '../utils/debug';
import type { ModifierSettings as ModifierSettingsType, ModifierConfig } from '../shared/types';
import {
	validatePlaytimeModifiers,
	validateReviewModifiers,
} from '../validators/modifierValidation';
import { MAX_EFFECT_SHIFT, REVIEW_SCORE_LABELS } from '../constants/modifierConstraints';

type ModifierKey = 'criticalBonus' | 'bonus' | 'penalty' | 'criticalPenalty';
type ModifierType = 'playtime' | 'review';

const MODIFIER_KEYS: ModifierKey[] = ['criticalBonus', 'bonus', 'penalty', 'criticalPenalty'];

const MODIFIER_LABELS: Record<ModifierKey, string> = {
	criticalBonus: 'Critical Bonus',
	bonus: 'Bonus',
	penalty: 'Penalty',
	criticalPenalty: 'Critical Penalty',
};

const BONUS_OPTIONS = Array.from({ length: MAX_EFFECT_SHIFT }, (_, i) => i + 1);
const PENALTY_OPTIONS = Array.from({ length: MAX_EFFECT_SHIFT }, (_, i) => -(i + 1));
const REVIEW_SCORE_OPTIONS = Array.from({ length: 9 }, (_, i) => 9 - i);

export default function ModifierSettings() {
	const [modifierSettings, setModifierSettings] = useState<ModifierSettingsType | null>(null);
	const [isDirty, setIsDirty] = useState(false);
	const [savedFeedback, setSavedFeedback] = useState(false);

	const validSettings = modifierSettings
		? validatePlaytimeModifiers(modifierSettings.playtime) &&
			validateReviewModifiers(modifierSettings.review)
		: true;

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

	const markDirty = () => {
		setIsDirty(true);
		setSavedFeedback(false);
	};

	const toggleSection = (type: ModifierType, checked: boolean) => {
		setModifierSettings((prev) => {
			if (!prev) return prev;
			return { ...prev, [type]: { ...prev[type], active: checked } };
		});
		markDirty();
	};

	const resetSection = (type: ModifierType) => {
		setModifierSettings((prev) => {
			if (!prev) return prev;
			return { ...prev, [type]: DEFAULT_SETTINGS.modifiers[type] };
		});
		markDirty();
	};

	const updateModifierField = (
		type: ModifierType,
		key: ModifierKey,
		field: 'active' | 'threshold' | 'effect',
		value: boolean | number
	) => {
		setModifierSettings((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				[type]: {
					...prev[type],
					[key]: { ...prev[type][key], [field]: value },
				},
			};
		});
		markDirty();
	};

	const handleSave = async () => {
		if (!modifierSettings || !validSettings) return;
		try {
			await updateSettings({ modifiers: modifierSettings });
			setIsDirty(false);
			setSavedFeedback(true);
			setTimeout(() => setSavedFeedback(false), 2000);
		} catch (error) {
			debug.error(error);
		}
	};

	const renderSection = (type: ModifierType, config: ModifierConfig | undefined) => {
		if (!config) return null;
		const isPlaytime = type === 'playtime';

		return (
			<div className="modifier-section">
				<div className="modifier-section-header">
					<label className="toggle-label">
						<input
							type="checkbox"
							checked={config.active}
							onChange={(e) => toggleSection(type, e.target.checked)}
							className="toggle-checkbox"
						/>
						<span className="toggle-switch"></span>
						<span className="toggle-text">
							{isPlaytime ? 'Include Playtime' : 'Include Review Score'}
						</span>
					</label>
					<button className="modifier-reset-btn" onClick={() => resetSection(type)}>
						Reset to default
					</button>
				</div>

				{config.active && (
					<div className="modifier-tiers">
						<div className="modifier-tiers-header">
							<span></span>
							<span className="modifier-col-label">Tier</span>
							<span className="modifier-col-label">Threshold</span>
							<span className="modifier-col-label">Rarity Bonus</span>
						</div>
						{MODIFIER_KEYS.map((key) => {
							const mod = config[key];
							const isBonus = key === 'criticalBonus' || key === 'bonus';
							const effectOptions = isBonus ? BONUS_OPTIONS : PENALTY_OPTIONS;
							return (
								<div
									key={key}
									className={`modifier-row${!mod.active ? ' modifier-row--inactive' : ''}`}
								>
									<input
										type="checkbox"
										checked={mod.active}
										onChange={(e) => updateModifierField(type, key, 'active', e.target.checked)}
										className="modifier-tier-checkbox"
									/>

									<span
										className={`modifier-tier-label modifier-tier-label--${isBonus ? 'bonus' : 'penalty'}`}
									>
										{MODIFIER_LABELS[key]}
									</span>

									<div className="modifier-input-group">
										<span className="modifier-comparator">{isBonus ? '≥' : '≤'}</span>
										{isPlaytime ? (
											<input
												type="number"
												value={mod.threshold}
												min={0}
												step={1}
												disabled={!mod.active}
												onChange={(e) => {
													const val = parseInt(e.target.value, 10);
													if (!isNaN(val) && val >= 0)
														updateModifierField(type, key, 'threshold', val);
												}}
												className="modifier-number-input"
											/>
										) : (
											<select
												value={mod.threshold}
												disabled={!mod.active}
												onChange={(e) =>
													updateModifierField(type, key, 'threshold', Number(e.target.value))
												}
												className={`modifier-select ${mod.threshold >= 6 ? 'modifier-select--positive' : mod.threshold === 5 ? 'modifier-select--mixed' : mod.threshold >= 1 ? 'modifier-select--negative' : ''}`}
											>
												{REVIEW_SCORE_OPTIONS.map((n) => (
													<option key={n} value={n}>
														{REVIEW_SCORE_LABELS[n]}
													</option>
												))}
											</select>
										)}
										{isPlaytime && <span className="modifier-input-unit">hrs</span>}
									</div>

									<div className="modifier-input-group">
										<select
											value={mod.effect}
											disabled={!mod.active}
											onChange={(e) =>
												updateModifierField(type, key, 'effect', Number(e.target.value))
											}
											className={`modifier-select modifier-select--${isBonus ? 'bonus' : 'penalty'}`}
										>
											{effectOptions.map((n) => (
												<option key={n} value={n}>
													{n > 0 ? `+${n}` : n}
												</option>
											))}
										</select>
										<span className="modifier-input-unit">tiers</span>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="modifier-settings">
			<div className="modifier-settings-grid">
				{renderSection('playtime', modifierSettings?.playtime)}
				{renderSection('review', modifierSettings?.review)}
			</div>

			<div className="modifier-save-row">
				{!validSettings && (
					<p className="modifier-validation-error">
						Invalid configuration — check that thresholds are ordered correctly and effects face the
						right direction.
					</p>
				)}
				<button
					className="modifier-save-btn"
					onClick={() => void handleSave()}
					disabled={!isDirty || !validSettings}
				>
					{savedFeedback ? 'Saved!' : 'Save Changes'}
				</button>
			</div>
		</div>
	);
}
