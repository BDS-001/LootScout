export type DomChild = string | number | HTMLElement | null | undefined;

export function createElement(tagName: string, className?: string): HTMLElement {
	const element = document.createElement(tagName);
	if (className) element.className = className;
	return element;
}

export function setText(element: HTMLElement, text: string | number): HTMLElement {
	element.textContent = String(text);
	return element;
}

export function setAttribute(element: HTMLElement, name: string, value: string): HTMLElement {
	element.setAttribute(name, value);
	return element;
}

export function addChild(element: HTMLElement, ...children: DomChild[]): HTMLElement {
	children.forEach((child) => {
		if (!child) return;

		if (typeof child === 'string' || typeof child === 'number') {
			element.appendChild(document.createTextNode(String(child)));
		} else {
			element.appendChild(child);
		}
	});
	return element;
}

export function onClick(element: HTMLElement, handler: (event: MouseEvent) => void): HTMLElement {
	element.addEventListener('click', handler);
	return element;
}

export const dom = {
	div: (className?: string) => createElement('div', className),
	span: (className?: string) => createElement('span', className),
	button: (className?: string) => createElement('button', className),
	a: (href: string, className?: string) =>
		setAttribute(createElement('a', className), 'href', href),
};

export function clearElement(element: HTMLElement): void {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

export function replaceElementContent(element: HTMLElement, ...newChildren: HTMLElement[]): void {
	clearElement(element);
	newChildren.forEach((child) => element.appendChild(child));
}
