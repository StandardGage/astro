import { createElement, startTransition, Fragment } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import StaticHtml from './static-html.js';

function isAlreadyHydrated(element) {
	for (const key in element) {
		if (key.startsWith('__reactContainer')) {
			return key;
		}
	}
}

let ids = 0;
// convert HTML string to React elements for experimental children flag; client-side
function convert(children) {
	let parser = new DOMParser();
	let doc = parser.parseFromString(children.toString().trim(), 'text/html');
	let id = ids++;
	let key = 0;
  
	function createReactElementFromNode(node) {
	  const childVnodes =
		node.childNodes.length
		  ? Array.from(node.childNodes).map((child) => createReactElementFromNode(child)).filter(Boolean)
		  : undefined;
  
	  if (node.nodeType === Node.DOCUMENT_NODE) {
		return createElement(Fragment, {}, childVnodes);
	  } else if (node.nodeType === Node.ELEMENT_NODE) {
		const innerProps = Array.from(node.attributes).reduce((props, attr) => {
		  props[attr.name] = attr.value;
		  return props;
		}, {});
		const className = innerProps.class;
		delete innerProps.class;
		const isVoidElement = ['img', 'input', 'br', 'hr', 'meta', 'area', 'base', 'col', 'command', 'embed', 'keygen', 'link', 'param', 'source', 'track', 'wbr'].includes(node.nodeName.toLowerCase());
		const elementProps = isVoidElement ? { ...innerProps, className, key:`${id}-${key++}` } : { ...innerProps, className, children: childVnodes, key:`${id}-${key++}` };
		return createElement(node.nodeName.toLowerCase(), elementProps);
	  } else if (node.nodeType === Node.TEXT_NODE) {
		// 0-length text gets omitted in JSX
		return node.nodeValue.trim() ? node.nodeValue : undefined;
	  }
	}
  
	const root = createReactElementFromNode(doc.body);
	return root.props.children;
}

function getChildren(childString, experimentalReactChildren) {
	if (experimentalReactChildren && childString) {
		return convert(childString);
	} else if (childString) {
		return createElement(StaticHtml, { value: childString });
	} else {
		return undefined;
	}
}

export default (element) =>
	(Component, props, { default: children, ...slotted }, { client }) => {
		if (!element.hasAttribute('ssr')) return;
		const renderOptions = {
			identifierPrefix: element.getAttribute('prefix'),
		};
		for (const [key, value] of Object.entries(slotted)) {
			props[key] = createElement(StaticHtml, { value, name: key });
		}
		const componentEl = 
			  createElement(
				Component,
				props,
				getChildren(children, element.hasAttribute('data-react-children'))
			  );

		const rootKey = isAlreadyHydrated(element);
		// HACK: delete internal react marker for nested components to suppress aggressive warnings
		if (rootKey) {
			delete element[rootKey];
		}
		if (client === 'only') {
			return startTransition(() => {
				const root = createRoot(element);
				root.render(componentEl);
				element.addEventListener('astro:unmount', () => root.unmount(), { once: true });
			});
		}
		startTransition(() => {
			const root = hydrateRoot(element, componentEl, renderOptions);
			root.render(componentEl);
			element.addEventListener('astro:unmount', () => root.unmount(), { once: true });
		});
	};
