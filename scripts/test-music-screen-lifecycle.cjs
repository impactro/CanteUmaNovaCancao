'use strict';

const assert = require('node:assert/strict');
const {
    createMusicScreenLifecycleGuard
} = require('../src/service/musicScreenLifecycleCore.cjs');

function testMenuCloseRestoresPlayerWhileRouteIsActive() {
    const lifecycle = createMusicScreenLifecycleGuard();
    let playerOpenCount = 0;

    assert.equal(lifecycle.isActive(), true);
    assert.equal(lifecycle.restorePlayerAfterMenuClose(() => {
        playerOpenCount += 1;
    }), true);
    assert.equal(playerOpenCount, 1);
}

function testLeavingClosesResourcesWithoutReopeningPlayer() {
    const lifecycle = createMusicScreenLifecycleGuard();
    const calls = [];

    assert.equal(lifecycle.beginLeaving({
        closeMenu: () => {
            calls.push('menu');
            lifecycle.restorePlayerAfterMenuClose(() => calls.push('reopened'));
        },
        closePlayer: () => calls.push('player'),
        clearLockScreenControls: () => calls.push('lock-screen')
    }), true);

    assert.equal(lifecycle.isActive(), false);
    assert.deepEqual(calls, ['menu', 'player', 'lock-screen']);
}

function testLeavingIsIdempotent() {
    const lifecycle = createMusicScreenLifecycleGuard();
    let cleanupCount = 0;

    assert.equal(lifecycle.beginLeaving({
        closeMenu: () => cleanupCount += 1,
        closePlayer: () => cleanupCount += 1,
        clearLockScreenControls: () => cleanupCount += 1
    }), true);
    assert.equal(lifecycle.beginLeaving({
        closeMenu: () => cleanupCount += 1
    }), false);
    assert.equal(cleanupCount, 3);
}

testMenuCloseRestoresPlayerWhileRouteIsActive();
testLeavingClosesResourcesWithoutReopeningPlayer();
testLeavingIsIdempotent();

console.log('Music screen lifecycle regression tests passed.');
