const AUDIO_CDN_BASE_URL = 'https://novacancao.azureedge.net/';

function normalizeAudioPath(value) {
    if (typeof value !== 'string' || value !== value.trim()) {
        throw new Error('Caminho de áudio inválido');
    }

    const path = value.normalize('NFC');

    if (
        !path.startsWith('audio/') ||
        /[\\%?#]/u.test(path) ||
        /[\u0000-\u001F\u007F]/u.test(path)
    ) {
        throw new Error('Caminho de áudio inválido');
    }

    const segments = path.split('/');

    if (
        segments.length < 2 ||
        segments.some(segment => !segment || segment === '.' || segment === '..') ||
        !path.toLocaleLowerCase().endsWith('.mp3')
    ) {
        throw new Error('Caminho de áudio inválido');
    }

    return path;
}

function resolveAudioUrl(value) {
    const path = normalizeAudioPath(value);
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');

    return `${AUDIO_CDN_BASE_URL}${encodedPath}`;
}

function hashAudioPath(value) {
    const path = normalizeAudioPath(value);
    let first = 0x811c9dc5;
    let second = 0x9e3779b9;

    for (let index = 0; index < path.length; index += 1) {
        const code = path.charCodeAt(index);
        first = Math.imul(first ^ code, 0x01000193);
        second = Math.imul(second ^ code, 0x85ebca6b);
    }

    return (
        (first >>> 0).toString(16).padStart(8, '0') +
        (second >>> 0).toString(16).padStart(8, '0')
    );
}

function getAudioCacheFileName(value) {
    return `audio-v1-${hashAudioPath(value)}.mp3`;
}

module.exports = {
    AUDIO_CDN_BASE_URL,
    getAudioCacheFileName,
    normalizeAudioPath,
    resolveAudioUrl,
};
