const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const fullDenomination = /Igreja de Cristo Internacional/;
const about = read('src', 'pages', 'About', 'index.js');
const lyrics = read('src', 'pages', 'Lyrics', 'index.js');
const historicalCredits = read('src', 'components', 'SpecialPage', 'index.js');
const catalog = read('src', 'utils', 'mockMusicData.json');

assert.doesNotMatch(about, fullDenomination);
assert.doesNotMatch(lyrics, fullDenomination);
assert.match(lyrics, /title:\s*'ICI',\s*type:\s*'ICI'/);
assert.match(historicalCredits, fullDenomination);
assert.match(catalog, fullDenomination);

console.log('Maintained UI language check passed; historical and authorship records preserved.');
