function normalizeSearch(value) {
    return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function sortRecentSearches(items) {
    return [...items].sort((left, right) =>
        Number(right.lastUpdate || 0) - Number(left.lastUpdate || 0) ||
        Number(right.id || 0) - Number(left.id || 0)
    );
}

function parseRecentSearches(value) {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? sortRecentSearches(parsed) : [];
    } catch (_error) {
        return [];
    }
}

function upsertRecentSearch(items, search, lastUpdate = Date.now()) {
    const normalized = normalizeSearch(search);
    if (!normalized) return sortRecentSearches(items);

    const match = items.find(item =>
        normalizeSearch(item.search).toLocaleLowerCase('pt-BR') ===
        normalized.toLocaleLowerCase('pt-BR')
    );
    const nextId = items.reduce(
        (maximum, item) => Math.max(maximum, Number(item.id) || 0),
        0
    ) + 1;
    const updated = items
        .filter(item => item !== match)
        .map(item => ({ ...item }));

    updated.push({
        id: match?.id ?? nextId,
        search: normalized,
        lastUpdate
    });

    return sortRecentSearches(updated);
}

function removeRecentSearch(items, id) {
    return sortRecentSearches(items.filter(item => item.id !== id));
}

async function clearAfterHydration(hydrationPromise, clear) {
    let hydrationError = null;

    try {
        await hydrationPromise;
    } catch (error) {
        hydrationError = error;
    }

    const value = await clear();
    return { hydrationError, value };
}

module.exports = {
    clearAfterHydration,
    normalizeSearch,
    parseRecentSearches,
    removeRecentSearch,
    sortRecentSearches,
    upsertRecentSearch
};
