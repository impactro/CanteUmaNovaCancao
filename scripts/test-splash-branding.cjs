const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const loader = fs.readFileSync(
  path.join(root, 'src', 'components', 'Loading', 'LoaderScreen', 'index.js'),
  'utf8'
);
const style = fs.readFileSync(
  path.join(root, 'src', 'style', 'LoaderScreenStyle.js'),
  'utf8'
);
const assetRelativePath = 'src/assets/crania_book_splash.png';
const assetPath = path.join(root, assetRelativePath);
const png = fs.readFileSync(assetPath);

assert.equal(app.expo.splash.image, `./${assetRelativePath}`);
assert.equal(app.expo.splash.resizeMode, 'contain');
assert.equal(app.expo.splash.backgroundColor, '#FFFFFF');
assert.equal(app.expo.backgroundColor, '#FFFFFF');
assert.match(loader, /crania_book_splash\.png/);
assert.match(loader, /resizeMode="contain"/);
assert.match(loader, /accessibilityLabel="Livro aberto da CrânIA"/);
assert.doesNotMatch(loader, /Animated|setTimeout|duration/);
assert.match(style, /backgroundColor:\s*'#FFFFFF'/);

assert.equal(png.toString('ascii', 1, 4), 'PNG');
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
assert.ok(width >= 1024, `Splash width is too small: ${width}px.`);
assert.ok(height >= 1024, `Splash height is too small: ${height}px.`);
assert.equal(png[25], 6, 'Splash PNG must use RGBA color type with alpha.');

console.log('Splash branding check passed.');
