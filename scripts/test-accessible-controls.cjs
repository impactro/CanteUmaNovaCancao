'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

const about = read('src/pages/About/index.js');
const aboutStyle = read('src/style/AboutStyle.js');
const filter = read('src/components/Filter/index.js');
const filterStyle = read('src/style/FilterStyle.js');
const lyrics = read('src/pages/Lyrics/index.js');

assert.match(about, /actions\.map/);
assert.match(about, /accessibilityRole="button"/);
assert.match(about, /accessibilityHint=/);
assert.match(about, /useRef\(0\)/);
assert.match(aboutStyle, /max-width: 680px/);
assert.match(aboutStyle, /min-height: 48px/);
assert.doesNotMatch(aboutStyle, /width: 160px/);

assert.match(filter, /accessibilityState=\{\{ selected: item\.selected \}\}/);
assert.match(filter, /keyExtractor=\{item => item\.type\}/);
assert.match(filter, /onScrollToIndexFailed=/);
assert.match(filterStyle, /min-height: 44px/);
assert.match(lyrics, /FILTERS\.map/);
assert.doesNotMatch(lyrics, /filterOrder\.forEach/);

console.log('Accessible controls check passed: responsive actions and immutable filter state.');
