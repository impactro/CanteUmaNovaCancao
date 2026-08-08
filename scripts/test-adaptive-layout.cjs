'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const adaptiveLayout = require('../src/service/adaptiveLayoutCore.cjs');

const projectRoot = path.resolve(__dirname, '..');

const compact = adaptiveLayout.getAdaptiveLayout(699);
assert.equal(compact.mode, 'compact');
assert.equal(compact.isWide, false);
assert.equal(compact.navigationRailWidth, 0);
assert.equal(compact.masterPaneWidth, 0);
assert.equal(compact.detailPaneWidth, 699);

const portraitTablet = adaptiveLayout.getAdaptiveLayout(800);
assert.equal(portraitTablet.mode, 'wide');
assert.equal(
    portraitTablet.navigationRailWidth,
    adaptiveLayout.NAVIGATION_RAIL_WIDTH
);
assert.ok(
    portraitTablet.masterPaneWidth >= adaptiveLayout.MASTER_PANE_MIN_WIDTH
);
assert.equal(
    portraitTablet.masterPaneWidth + portraitTablet.detailPaneWidth,
    portraitTablet.contentWidth
);

const landscapeTablet = adaptiveLayout.getAdaptiveLayout(1280);
assert.equal(landscapeTablet.mode, 'wide');
assert.ok(landscapeTablet.detailPaneWidth > landscapeTablet.masterPaneWidth);
assert.ok(
    landscapeTablet.masterPaneWidth <= adaptiveLayout.MASTER_PANE_MAX_WIDTH
);

assert.equal(adaptiveLayout.isWideLayout(Number.NaN), false);
assert.equal(adaptiveLayout.isWideLayout(-10), false);

const music = {
    number: 23,
    title: 'Uma nova canção',
    author: 'Autor',
    album: 'undefined',
    music: {
        text: 'Letra',
        audio: 'audio.mp3',
        cifra: 'Cifra',
        video: 'https://example.test/video'
    }
};
const routeParams = adaptiveLayout.toMusicRouteParams(music);
assert.deepEqual(routeParams, {
    numMusic: 23,
    musicTxt: 'Letra',
    musicTitle: 'Uma nova canção',
    audio: 'audio.mp3',
    author: 'Autor',
    image: 'undefined',
    isCipher: 'cifra',
    isVideo: 'video',
    cipher: 'Cifra',
    linkVideo: 'https://example.test/video'
});
assert.throws(
    () => adaptiveLayout.toMusicRouteParams(null),
    /música válida/
);

const appConfig = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'app.json'), 'utf8')
);
assert.equal(appConfig.expo.orientation, 'default');

const androidManifestPath = path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'main',
    'AndroidManifest.xml'
);

if (fs.existsSync(androidManifestPath)) {
    const androidManifest = fs.readFileSync(androidManifestPath, 'utf8');
    assert.doesNotMatch(androidManifest, /android:screenOrientation="portrait"/);
}

const responsiveSources = [
    'src/routes/router.js',
    'src/components/Music/index.js',
    'src/pages/Lyrics/index.js',
    'src/pages/Cipher/index.js',
    'src/pages/Search/index.js'
];

for (const relativePath of responsiveSources) {
    const source = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
    assert.match(
        source,
        /useWindowDimensions/,
        `${relativePath} deve reagir à largura disponível.`
    );
    assert.doesNotMatch(
        source,
        /Dimensions\.(?:get|addEventListener)/,
        `${relativePath} não deve decidir layout com Dimensions estático.`
    );
}

const musicSource = fs.readFileSync(
    path.join(projectRoot, 'src', 'components', 'Music', 'index.js'),
    'utf8'
);
assert.match(musicSource, /navigation\.setParams/);
assert.match(musicSource, /<WideMusicCatalog/);
assert.doesNotMatch(musicSource, /key=\{adaptiveLayout\.(?:mode|isWide)\}/);

const routerSource = fs.readFileSync(
    path.join(projectRoot, 'src', 'routes', 'router.js'),
    'utf8'
);
assert.match(routerSource, /<WideNavigationRail/);
assert.match(routerSource, /<BottomTabBar/);

console.log(
    'Adaptive layout check passed: compact/wide breakpoints, route state, ' +
    'rotation config and reactive source contracts.'
);
