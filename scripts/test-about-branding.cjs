const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const aboutPath = path.join(root, 'src', 'pages', 'About', 'index.js');
const source = fs.readFileSync(aboutPath, 'utf8');

assert.match(source, /Redesenvolvido por CrânIA EcoSystem/);
assert.match(source, /Mantido por:/);
assert.match(source, /APP_MAINTAINER_NAME/);
assert.match(source, /appInfo\.expo\.version/);
assert.match(source, /https:\/\/crania\.ia\.br\//);
assert.match(source, /Conheça a CrânIA/);
assert.doesNotMatch(source, /https:\/\/www\.icisp\.org\.br/);
assert.doesNotMatch(source, /Visite nossa Igreja/);
assert.doesNotMatch(source, /SUPPORT_CONTACT_EMAIL[^;]*<|\{SUPPORT_CONTACT_EMAIL\}/);

console.log('About branding check passed.');
