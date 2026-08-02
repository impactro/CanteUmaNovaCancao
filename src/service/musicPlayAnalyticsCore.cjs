const START_TOLERANCE_SECONDS = 0.5;

class MusicPlayExecutionTracker {
    constructor() {
        this.executionActive = false;
        this.pendingNewExecution = false;
        this.restartRequested = false;
    }

    intentToPlay(status = {}) {
        const currentTime = Number(status.currentTime) || 0;
        const duration = Number(status.duration) || 0;
        const atEnd =
            Boolean(status.didJustFinish) ||
            (duration > 0 && currentTime >= duration);

        this.pendingNewExecution =
            !this.executionActive || this.restartRequested || atEnd;
        this.restartRequested = false;
    }

    playbackStarted() {
        const shouldLog = this.pendingNewExecution;

        this.pendingNewExecution = false;
        this.executionActive = true;

        return shouldLog;
    }

    playbackPaused() {
        this.pendingNewExecution = false;
    }

    playbackSeeked(positionSeconds) {
        if (
            this.executionActive &&
            Number(positionSeconds) <= START_TOLERANCE_SECONDS
        ) {
            this.restartRequested = true;
        }
    }

    playbackFinished() {
        this.executionActive = false;
        this.pendingNewExecution = false;
        this.restartRequested = false;
    }

    sourceChanged() {
        this.playbackFinished();
    }
}

module.exports = {
    MusicPlayExecutionTracker,
    START_TOLERANCE_SECONDS,
};
