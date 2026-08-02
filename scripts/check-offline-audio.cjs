const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
    AUDIO_CDN_BASE_URL,
    getAudioCacheFileName,
    normalizeAudioPath,
    resolveAudioUrl,
} = require('../src/service/audioCatalog.cjs');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const catalog = JSON.parse(read('src/utils/mockMusicData.json'));
const packageJson = JSON.parse(read('package.json'));
const appJson = JSON.parse(read('app.json'));

assert.equal(catalog.length, 199, 'O catálogo embutido deve manter 199 músicas');

const numbers = new Set();
const audioPaths = [];

for (const track of catalog) {
    assert.equal(typeof track.title, 'string');
    assert.equal(typeof track.author, 'string');
    assert.equal(Number.isInteger(track.number), true);
    assert.equal(typeof track.music?.text, 'string');
    assert.equal(numbers.has(track.number), false, `Número duplicado: ${track.number}`);
    numbers.add(track.number);

    if (track.music.audio) {
        const normalized = normalizeAudioPath(track.music.audio);
        const resolved = resolveAudioUrl(normalized);

        assert.equal(resolved.startsWith(AUDIO_CDN_BASE_URL), true);
        assert.equal(/^https?:\/\//u.test(normalized), false);
        assert.equal(normalized.includes('\\'), false);
        audioPaths.push(normalized);
    }
}

assert.equal(audioPaths.length, 154, 'Apenas as 154 referências CDN válidas devem permanecer');
assert.equal(
    catalog.filter(track => !track.music.audio).length,
    45,
    'As 27 referências mortas devem somar-se às 18 músicas sem áudio'
);
assert.equal(
    catalog.find(track => track.number === 503).music.audio,
    'audio/Nova Canção/503.Salmo 34.mp3'
);
assert.equal(
    catalog.find(track => track.number === 147).music.audio,
    'audio/Nova Canção/147.Primeiras manhãs.mp3'
);
assert.equal(/impactro\.com\.br/iu.test(JSON.stringify(catalog)), false);

const invalidAudioPaths = [
    '',
    ' ',
    null,
    undefined,
    {},
    'http://www.impactro.com.br/a.mp3',
    'https://novacancao.azureedge.net/audio/a.mp3',
    '//evil.example/a.mp3',
    '/audio/a.mp3',
    'audio\\a.mp3',
    'audio/../a.mp3',
    'audio/./a.mp3',
    'audio//a.mp3',
    'audio/%2e%2e/a.mp3',
    'audio/a.mp3?token=x',
    'audio/a.mp3#fragment',
    'audios/a.mp3',
    'audio/a.exe',
];

for (const invalidPath of invalidAudioPaths) {
    assert.throws(() => normalizeAudioPath(invalidPath));
}

const firstPath = 'audio/Nova Canção/503.Salmo 34.mp3';
const secondPath = 'audio/Nova Canção/147.Primeiras manhãs.mp3';
assert.equal(getAudioCacheFileName(firstPath), getAudioCacheFileName(firstPath));
assert.notEqual(getAudioCacheFileName(firstPath), getAudioCacheFileName(secondPath));
assert.match(getAudioCacheFileName(firstPath), /^audio-v1-[a-f0-9]{16}\.mp3$/u);

const uniquePaths = [...new Set(audioPaths)];
const uniqueCacheFiles = new Set(uniquePaths.map(getAudioCacheFileName));
assert.equal(
    uniqueCacheFiles.size,
    uniquePaths.length,
    'Não pode haver colisão de cache no catálogo atual'
);

assert.equal(packageJson.dependencies['expo-av'], undefined);
assert.equal(packageJson.dependencies['expo-audio'], '~1.1.1');

const audioPlugin = appJson.expo.plugins.find(
    plugin => Array.isArray(plugin) && plugin[0] === 'expo-audio'
);
assert.ok(audioPlugin, 'O config plugin expo-audio deve estar configurado');
assert.equal(audioPlugin[1].recordAudioAndroid, false);
assert.equal(audioPlugin[1].microphonePermission, false);
assert.equal(
    appJson.expo.android.blockedPermissions.includes('android.permission.RECORD_AUDIO'),
    true
);
assert.equal(appJson.expo.ios.infoPlist.UIBackgroundModes.includes('audio'), true);

const expoAudioManifest = read('node_modules/expo-audio/android/src/main/AndroidManifest.xml');
for (const requiredNativeEntry of [
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    '.service.AudioControlsService',
    'android:foregroundServiceType="mediaPlayback"',
]) {
    assert.equal(
        expoAudioManifest.includes(requiredNativeEntry),
        true,
        `Manifest do expo-audio sem ${requiredNativeEntry}`
    );
}

const playerSource = read('src/components/Music/index.js');
for (const requiredPlayerApi of [
    'useAudioPlayer',
    'useAudioPlayerStatus',
    'shouldPlayInBackground: true',
    "interruptionMode: 'doNotMix'",
    'setActiveForLockScreen',
    'downloadAudioToDevice',
    'removeDownloadedAudio',
]) {
    assert.equal(playerSource.includes(requiredPlayerApi), true);
}
assert.equal(playerSource.includes('expo-av'), false);

const cacheSource = read('src/service/audioCache.js');
for (const requiredFileSystemApi of [
    'Directory',
    'File',
    'Paths.document',
    'File.downloadFileAsync',
    '.part',
]) {
    assert.equal(cacheSource.includes(requiredFileSystemApi), true);
}

const catalogServiceSource = read('src/service/http.js');
assert.equal(catalogServiceSource.includes('mockMusicData.json'), true);
assert.equal(catalogServiceSource.includes('callApi'), false);

const legalStyleSource = read('src/style/TermsAndPrivacyStyle.js');
assert.equal(legalStyleSource.includes('text-decoration-line: underline;'), true);
assert.equal(legalStyleSource.includes('text-decoration-color:'), true);
assert.equal(/text-decoration:\s*underline/iu.test(legalStyleSource), false);

console.log(
    `Offline/audio checks passed: ${catalog.length} músicas, ` +
    `${audioPaths.length} áudios CDN, ${uniqueCacheFiles.size} arquivos de cache possíveis.`
);
