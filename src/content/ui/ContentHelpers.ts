import { dom, setText, addChild, setAttribute } from '../utils/DomBuilder';
import { ApiError } from '../../lib/shared/types';

export function createFooter(
	links: Array<{ url: string; text: string }>,
	disclaimer: string
): HTMLElement {
	const footerInfo = dom.span('footer_info');

	addChild(footerInfo, 'Powered by\u00A0');

	links.forEach((link, index) => {
		addChild(footerInfo, setText(setAttribute(dom.a(link.url), 'target', '_blank'), link.text));

		if (index < links.length - 1) {
			addChild(footerInfo, '\u00A0and\u00A0');
		}
	});

	addChild(footerInfo, '.', document.createElement('br'), disclaimer);

	return addChild(dom.div('loot_scout_footer'), footerInfo);
}

export function createStandardFooter(): HTMLElement {
	return createFooter(
		[
			{ url: 'https://gg.deals/', text: 'GG.deals' },
			{ url: 'https://store.steampowered.com/', text: 'Steam' },
		],
		'Not affiliated with GG.deals or Valve Corporation.'
	);
}

export function createSimpleFooter(): HTMLElement {
	return createFooter(
		[{ url: 'https://store.steampowered.com/', text: 'Steam' }],
		'Not affiliated with Valve Corporation.'
	);
}

export function getErrorDetails(error?: ApiError): string | null {
	if (!error) return null;

	const errorMessages: Record<number, string> = {
		429: 'Rate limit exceeded. Please try again in a few minutes.',
		404: 'Game not found in our database.',
		500: 'Server error. Our team has been notified.',
		401: 'Authentication failed. Please check extension settings.',
	};

	return errorMessages[error.code] || (error.code ? `Error code: ${error.code}` : null);
}
