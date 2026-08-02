const assert = require('node:assert/strict');
const history = require('../src/service/searchHistoryCore.cjs');

async function run() {
    const original = [
        { id: 1, search: 'Aleluia', lastUpdate: 100 },
        { id: 2, search: 'Salmo', lastUpdate: 200 }
    ];
    const originalSnapshot = JSON.stringify(original);
    const updated = history.upsertRecentSearch(original, '  aleluia  ', 300);

    assert.equal(JSON.stringify(original), originalSnapshot, 'entrada não pode ser mutada');
    assert.equal(updated.length, 2, 'busca equivalente não pode duplicar');
    assert.deepEqual(updated.map(item => item.id), [1, 2], 'mais recente deve ficar primeiro');
    assert.equal(updated[0].lastUpdate, 300);

    const inserted = history.upsertRecentSearch(updated, 'Nova busca', 400);
    assert.deepEqual(inserted.map(item => item.search), ['Nova busca', 'aleluia', 'Salmo']);
    assert.equal(inserted[0].id, 3, 'novo id deve ser monotônico');
    assert.deepEqual(history.removeRecentSearch(inserted, 1).map(item => item.id), [3, 2]);
    assert.deepEqual(history.parseRecentSearches('{inválido'), []);
    assert.deepEqual(history.parseRecentSearches(JSON.stringify(original)).map(item => item.id), [2, 1]);

    const order = [];
    let finishHydration;
    const hydration = new Promise(resolve => {
        finishHydration = () => {
            order.push('hydrated');
            resolve();
        };
    });
    const clearing = history.clearAfterHydration(hydration, async () => {
        order.push('cleared');
    });

    await Promise.resolve();
    assert.deepEqual(order, [], 'limpeza não pode ultrapassar a hidratação pendente');
    finishHydration();
    const successfulClear = await clearing;
    assert.deepEqual(order, ['hydrated', 'cleared']);
    assert.equal(successfulClear.hydrationError, null);

    const expectedError = new Error('falha simulada');
    let clearedAfterFailure = false;
    const failedHydration = await history.clearAfterHydration(
        Promise.reject(expectedError),
        async () => {
            clearedAfterFailure = true;
        }
    );
    assert.equal(clearedAfterFailure, true, 'falha de hidratação não pode impedir a limpeza');
    assert.equal(failedHydration.hydrationError, expectedError);

    console.log('Search history behavior passed');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
