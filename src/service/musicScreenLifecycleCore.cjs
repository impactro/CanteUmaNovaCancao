'use strict';

function callSafely(callback) {
    if (typeof callback !== 'function') {
        return;
    }

    try {
        callback();
    } catch (error) {
        console.warn('Falha ao encerrar um recurso da tela de música:', error);
    }
}

function createMusicScreenLifecycleGuard() {
    let leaving = false;

    return {
        isActive() {
            return !leaving;
        },

        beginLeaving(callbacks = {}) {
            if (leaving) {
                return false;
            }

            // Mark the route as leaving before closing either modal. Modalize can
            // dispatch onClose synchronously, and that callback must not reopen
            // the persistent player while React Navigation removes the screen.
            leaving = true;

            callSafely(callbacks.closeMenu);
            callSafely(callbacks.closePlayer);
            callSafely(callbacks.clearLockScreenControls);

            return true;
        },

        restorePlayerAfterMenuClose(openPlayer) {
            if (leaving) {
                return false;
            }

            callSafely(openPlayer);
            return true;
        }
    };
}

module.exports = {
    createMusicScreenLifecycleGuard
};
