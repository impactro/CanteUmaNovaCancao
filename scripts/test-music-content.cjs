'use strict';

const assert = require('node:assert/strict');
const catalog = require('../src/utils/mockMusicData.json');
const musicContentCore = require('../src/service/musicContentCore.cjs');

const allContent = musicContentCore.getAvailableContent({
    audio: 'audio/test.mp3',
    text: 'Letra',
    cifra: 'C',
    video: 'https://example.com/music'
});

assert.deepEqual(
    allContent.map(({ key }) => key),
    ['audio', 'lyrics', 'cipher', 'link'],
    'all supported content types must be detected in the stable display order'
);

assert.deepEqual(
    musicContentCore.getAvailableContent({
        audio: ' ',
        text: 'Letra',
        cifra: null,
        video: ''
    }).map(({ key }) => key),
    ['lyrics'],
    'empty or unsupported values must not produce indicators'
);

assert.equal(
    musicContentCore.getAccessibilityLabel({ text: 'Letra', audio: 'audio/test.mp3' }),
    'Conteúdo disponível: áudio, letra'
);

for (const [index, item] of catalog.entries()) {
    const available = musicContentCore.getAvailableContent(item.music);

    for (const { field } of available) {
        assert.equal(
            musicContentCore.hasContent(item.music[field]),
            true,
            `catalog item ${index} must only expose present content`
        );
    }
}

console.log(`Music content indicators validated against ${catalog.length} catalog items.`);
