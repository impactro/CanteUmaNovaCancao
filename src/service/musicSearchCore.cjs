const Fuse = require('fuse.js');

const DEFAULT_THRESHOLD = 0.35;
const DEFAULT_MIN_MATCH = 2;
const FIELD_WEIGHTS = {
    title: 7,
    number: 5,
    author: 3,
    content: 2
};

let cachedItems = null;
let cachedFuse = null;

function normalizeText(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildDocuments(items) {
    return items.map((item, sourceIndex) => ({
        sourceIndex,
        number: normalizeText(item.number),
        title: normalizeText(item.title),
        author: normalizeText(item.author),
        content: normalizeText(item.music?.text),
        source: item
    }));
}

function createOptions() {
    const total = Object.values(FIELD_WEIGHTS).reduce((sum, value) => sum + value, 0);

    return {
        includeScore: true,
        shouldSort: true,
        threshold: DEFAULT_THRESHOLD,
        ignoreLocation: true,
        minMatchCharLength: DEFAULT_MIN_MATCH,
        keys: Object.entries(FIELD_WEIGHTS).map(([name, weight]) => ({
            name,
            weight: weight / total
        }))
    };
}

function ensureIndex(items) {
    if (cachedFuse && cachedItems === items) {
        return cachedFuse;
    }

    cachedItems = items;
    cachedFuse = new Fuse(buildDocuments(items), createOptions());
    return cachedFuse;
}

function exactRank(entry, query) {
    if (entry.number === query) return 0;
    if (entry.title === query) return 1;
    if (entry.title.startsWith(query)) return 2;
    if (entry.title.includes(query)) return 3;
    if (entry.author === query) return 4;
    if (entry.author.includes(query)) return 5;
    if (entry.content.includes(query)) return 6;
    return 7;
}

function searchMusics(items, query) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery || normalizedQuery.length < DEFAULT_MIN_MATCH) {
        return [];
    }

    const results = ensureIndex(items).search(normalizedQuery);
    const ordered = results
        .map(result => ({
            item: result.item.source,
            sourceIndex: result.item.sourceIndex,
            rank: exactRank(result.item, normalizedQuery),
            score: result.score ?? 1
        }))
        .sort((left, right) =>
            left.rank - right.rank ||
            left.score - right.score ||
            left.sourceIndex - right.sourceIndex
        );

    const seen = new Set();
    return ordered.reduce((unique, result) => {
        const key = String(result.item.number);
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(result.item);
        }
        return unique;
    }, []);
}

module.exports = {
    DEFAULT_MIN_MATCH,
    DEFAULT_THRESHOLD,
    FIELD_WEIGHTS,
    buildDocuments,
    createOptions,
    normalizeText,
    searchMusics
};
