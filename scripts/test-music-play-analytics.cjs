const assert = require('node:assert/strict');
const {
    MusicPlayExecutionTracker,
} = require('../src/service/musicPlayAnalyticsCore.cjs');

const tracker = new MusicPlayExecutionTracker();

tracker.intentToPlay({ currentTime: 0, duration: 180 });
assert.equal(tracker.playbackStarted(), true);
assert.equal(tracker.playbackStarted(), false);

tracker.playbackPaused();
tracker.intentToPlay({ currentTime: 42, duration: 180 });
assert.equal(
    tracker.playbackStarted(),
    false,
    'Retomar a mesma execução após pause não gera music_play'
);

tracker.playbackPaused();
tracker.intentToPlay({ currentTime: 0.2, duration: 180 });
assert.equal(
    tracker.playbackStarted(),
    false,
    'Retomar uma pausa perto do início também não gera music_play'
);

tracker.playbackPaused();
tracker.playbackSeeked(0);
tracker.intentToPlay({ currentTime: 0, duration: 180 });
assert.equal(
    tracker.playbackStarted(),
    true,
    'Voltar explicitamente ao início e tocar gera nova execução'
);

tracker.playbackFinished();
tracker.intentToPlay({
    currentTime: 180,
    duration: 180,
    didJustFinish: true,
});
assert.equal(
    tracker.playbackStarted(),
    true,
    'Iniciar novamente após o término gera nova execução'
);

tracker.playbackPaused();
tracker.playbackSeeked(0);
tracker.intentToPlay({ currentTime: 0, duration: 180 });
assert.equal(
    tracker.playbackStarted(),
    true,
    'Voltar ao início e iniciar gera nova execução'
);

tracker.sourceChanged();
tracker.intentToPlay({ currentTime: 0, duration: 180 });
assert.equal(
    tracker.playbackStarted(),
    true,
    'Trocar a fonte reinicia o ciclo de execução'
);

tracker.playbackPaused();
assert.equal(
    tracker.playbackStarted(),
    false,
    'Mudança de status sem intenção de play não gera evento'
);

console.log(
    'music_play semantics passed: one event per execution, no pause/resume duplicate.'
);
