import { expect } from 'chai';
import convert from '../vnode-children.js';

describe('experimental react children', () => {
	it('has no children property for direct children', () => {
		const [imgVNode] = convert('<img src="abc" alt="test"></img><img src="def"></img><img src="ghi"></img>');
		expect(imgVNode.props).to.not.have.property('children');
	});

	it('does not use dangerouslySetInnerHTML', () => {
		const [imgVNode] = convert('<img></img><img></img><img></img>');
		expect(imgVNode.props).to.not.have.property('dangerouslySetInnerHTML');
	});

	it('has no children property for nested children', () => {
		const [divVNode] = convert('<div><img src="xyz"></img></div>');
		const [imgVNode] = divVNode.props.children;
		expect(imgVNode.props).to.not.have.property('children');
	});
});
