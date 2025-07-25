import * as dom from '../utils/DomBuilder';

export function createGameTitleSection(title: string, averagePlaytime?: number): HTMLElement {
	const titleSection = dom.createElement('div', 'game-title-section');
	const titleDiv = dom.setText(dom.createElement('div', 'game-title'), title);
	dom.addChild(titleSection, titleDiv);

	if (averagePlaytime && averagePlaytime > 0) {
		const playtimeDiv = dom.setText(
			dom.createElement('div', 'game-playtime'),
			`Average playtime: ${averagePlaytime.toFixed(1)} hours`
		);
		dom.addChild(titleSection, playtimeDiv);
	}

	return titleSection;
}
