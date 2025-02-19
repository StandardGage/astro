import { expect } from 'chai';
import * as cheerio from 'cheerio';
import eol from 'eol';
import { loadFixture } from './test-utils.js';

describe('PostCSS', function () {
	let fixture;
	let bundledCSS;
	before(async () => {
		this.timeout(45000); // test needs a little more time in CI
		fixture = await loadFixture({
			root: './fixtures/postcss',
			// test suite was authored when inlineStylesheets defaulted to never
			build: { inlineStylesheets: 'never' },
		});
		await fixture.build();

		// get bundled CSS (will be hashed, hence DOM query)
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const bundledCSSHREF = $('link[rel=stylesheet][href^=/_astro/]').attr('href');
		bundledCSS = (await fixture.readFile(bundledCSSHREF.replace(/^\/?/, '/')))
			.replace(/\s/g, '')
			.replace('/n', '');
	});

	/** All test cases check whether nested styles (i.e. &.nested {}) are correctly transformed */
	it('works in Astro page styles', () => {
		expect(bundledCSS).to.match(/\.astro-page\[data-astro-cid-.*?\]\.nested/);
	});

	it('works in Astro component styles', () => {
		expect(bundledCSS).to.match(/\.astro-component\[data-astro-cid-.*?\]\.nested/);
	});

	it('works in JSX', () => {
		expect(bundledCSS).to.match(/\.solid(\.(w|-)*)*\.nested/);
	});

	it('works in Vue', () => {
		expect(bundledCSS).to.match(/\.vue(\.(w|-)*)*\.nested/);
	});

	it('works in Svelte', () => {
		expect(bundledCSS).to.match(/\.svelte(\.(w|-)*)*\.nested/);
	});

	it('ignores CSS in public/', async () => {
		const publicCSS = (await fixture.readFile('/global.css'))
			.trim()
			.replace(/\s/g, '')
			.replace('/n', '');
		// neither minified nor prefixed
		expect(eol.lf(publicCSS)).to.equal(`.global{appearance:none;}`);
	});
});
