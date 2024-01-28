import { parse, DOCUMENT_NODE, ELEMENT_NODE, TEXT_NODE } from 'ultrahtml';
import { createElement, Fragment } from 'react';

let ids = 0;
export default function convert(children) {
	let doc = parse(children.toString().trim());
	let id = ids++;
	let key = 0;

	function createReactElementFromNode(node) {
		const childVnodes =
			Array.isArray(node.children) && node.children.length
				? node.children.map((child) => createReactElementFromNode(child)).filter(Boolean)
				: undefined;
		if (node.type === DOCUMENT_NODE) {
			return createElement(Fragment, {}, childVnodes);
		} else if (node.type === ELEMENT_NODE) {
			const { class: className,  ...props } = node.attributes;
			const isVoidElement = ['img', 'input', 'br', 'hr', 'meta', 'area', 'base', 'col', 'command', 'embed', 'keygen', 'link', 'param', 'source', 'track', 'wbr'].includes(node.name);
			const elementProps = isVoidElement ? { ...props, className, key:`${id}-${key++}` } : { ...props, className, children: childVnodes };
			return createElement(node.name, elementProps);
		} else if (node.type === TEXT_NODE) {
			// 0-length text gets omitted in JSX
			return node.value.trim() ? node.value : undefined;
		}
	}

	const root = createReactElementFromNode(doc);
	return root.props.children;
}
