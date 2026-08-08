'use strict';

const CONTENT_DEFINITIONS = Object.freeze([
    Object.freeze({ key: 'audio', field: 'audio', label: 'Áudio' }),
    Object.freeze({ key: 'lyrics', field: 'text', label: 'Letra' }),
    Object.freeze({ key: 'cipher', field: 'cifra', label: 'Cifra' }),
    Object.freeze({ key: 'link', field: 'video', label: 'Link' })
]);

function hasContent(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function getAvailableContent(music) {
    const safeMusic = music && typeof music === 'object' ? music : {};

    return CONTENT_DEFINITIONS.filter(({ field }) => hasContent(safeMusic[field]));
}

function getAccessibilityLabel(music) {
    const labels = getAvailableContent(music).map(({ label }) => label.toLowerCase());

    return labels.length
        ? `Conteúdo disponível: ${labels.join(', ')}`
        : 'Nenhum conteúdo disponível';
}

module.exports = {
    CONTENT_DEFINITIONS,
    getAccessibilityLabel,
    getAvailableContent,
    hasContent
};
