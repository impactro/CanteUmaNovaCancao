'use strict';

const WIDE_LAYOUT_MIN_WIDTH = 700;
const NAVIGATION_RAIL_WIDTH = 88;
const MASTER_PANE_MIN_WIDTH = 280;
const MASTER_PANE_MAX_WIDTH = 400;
const MASTER_PANE_RATIO = 0.36;

function normalizeWidth(width) {
    const numericWidth = Number(width);

    return Number.isFinite(numericWidth) && numericWidth > 0
        ? numericWidth
        : 0;
}

function isWideLayout(width) {
    return normalizeWidth(width) >= WIDE_LAYOUT_MIN_WIDTH;
}

function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}

function getAdaptiveLayout(width) {
    const windowWidth = normalizeWidth(width);
    const wide = isWideLayout(windowWidth);
    const navigationRailWidth = wide ? NAVIGATION_RAIL_WIDTH : 0;
    const contentWidth = Math.max(windowWidth - navigationRailWidth, 0);
    const masterPaneWidth = wide
        ? clamp(
            Math.round(contentWidth * MASTER_PANE_RATIO),
            MASTER_PANE_MIN_WIDTH,
            MASTER_PANE_MAX_WIDTH
        )
        : 0;

    return {
        mode: wide ? 'wide' : 'compact',
        isWide: wide,
        windowWidth,
        contentWidth,
        navigationRailWidth,
        masterPaneWidth,
        detailPaneWidth: Math.max(contentWidth - masterPaneWidth, 0)
    };
}

function toMusicRouteParams(item) {
    if (!item || !item.music) {
        throw new TypeError('Uma música válida é obrigatória.');
    }

    const { number, title, music, author, album } = item;
    const { text, audio, cifra, video } = music;

    return {
        numMusic: number,
        musicTxt: text,
        musicTitle: title,
        audio,
        author,
        image: album,
        isCipher: cifra && 'cifra',
        isVideo: video && 'video',
        cipher: cifra,
        linkVideo: video
    };
}

module.exports = {
    WIDE_LAYOUT_MIN_WIDTH,
    NAVIGATION_RAIL_WIDTH,
    MASTER_PANE_MIN_WIDTH,
    MASTER_PANE_MAX_WIDTH,
    getAdaptiveLayout,
    isWideLayout,
    toMusicRouteParams
};
