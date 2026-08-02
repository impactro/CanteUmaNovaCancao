const DEFAULT_MINIMUM_MP3_BYTES = 16 * 1024;

class AudioDownloadCancelledError extends Error {
    constructor() {
        super('O download foi cancelado porque o áudio foi removido');
        this.name = 'AudioDownloadCancelledError';
    }
}

function hasId3Header(header) {
    return (
        header?.length >= 3 &&
        header[0] === 0x49 &&
        header[1] === 0x44 &&
        header[2] === 0x33
    );
}

function hasMpegFrameHeader(header) {
    if (!header || header.length < 4) {
        return false;
    }

    const version = (header[1] >> 3) & 0x03;
    const layer = (header[1] >> 1) & 0x03;
    const bitrate = (header[2] >> 4) & 0x0f;
    const sampleRate = (header[2] >> 2) & 0x03;

    return (
        header[0] === 0xff &&
        (header[1] & 0xe0) === 0xe0 &&
        version !== 0x01 &&
        layer !== 0x00 &&
        bitrate !== 0x00 &&
        bitrate !== 0x0f &&
        sampleRate !== 0x03
    );
}

function isValidMp3File(info, minimumBytes = DEFAULT_MINIMUM_MP3_BYTES) {
    return Boolean(
        info?.exists &&
        Number.isFinite(info.size) &&
        info.size >= minimumBytes &&
        (hasId3Header(info.header) || hasMpegFrameHeader(info.header))
    );
}

class AudioCacheManager {
    constructor(adapter, options = {}) {
        this.adapter = adapter;
        this.minimumBytes =
            options.minimumBytes || DEFAULT_MINIMUM_MP3_BYTES;
        this.inFlight = new Map();
        this.generations = new Map();
        this.operationCounter = 0;
    }

    getGeneration(key) {
        return this.generations.get(key) || 0;
    }

    bumpGeneration(key) {
        const next = this.getGeneration(key) + 1;
        this.generations.set(key, next);
        return next;
    }

    nextOperationId() {
        this.operationCounter += 1;

        if (this.adapter.createOperationId) {
            return this.adapter.createOperationId(this.operationCounter);
        }

        return `operation-${this.operationCounter}`;
    }

    getCachedUri(audioPath) {
        const key = this.adapter.cacheKey(audioPath);
        const target = this.adapter.finalPath(key);
        const info = this.adapter.inspect(target);

        return isValidMp3File(info, this.minimumBytes)
            ? info.uri
            : null;
    }

    download(audioPath, remoteUrl) {
        const key = this.adapter.cacheKey(audioPath);
        const existing = this.inFlight.get(key);

        if (existing) {
            return existing.promise;
        }

        const operation = {
            generation: this.getGeneration(key),
            id: this.nextOperationId(),
        };
        const promise = this.performDownload(
            key,
            remoteUrl,
            operation
        );

        this.inFlight.set(key, { promise, operation });

        const clear = () => {
            if (this.inFlight.get(key)?.promise === promise) {
                this.inFlight.delete(key);
            }
        };
        promise.then(clear, clear);

        return promise;
    }

    async performDownload(key, remoteUrl, operation) {
        this.adapter.prepareWrite();

        const target = this.adapter.finalPath(key);
        const temporary = this.adapter.temporaryPath(key, operation.id);
        const backup = this.adapter.backupPath(key, operation.id);

        this.adapter.remove(temporary);
        this.adapter.remove(backup);

        try {
            await this.adapter.download(remoteUrl, temporary);

            const downloadedInfo = this.adapter.inspect(temporary);
            if (!isValidMp3File(downloadedInfo, this.minimumBytes)) {
                throw new Error(
                    'O download não contém um arquivo MP3 íntegro'
                );
            }

            if (this.getGeneration(key) !== operation.generation) {
                throw new AudioDownloadCancelledError();
            }

            const committedInfo = this.commitValidatedFile(
                target,
                temporary,
                backup
            );

            return committedInfo.uri;
        } finally {
            this.adapter.remove(temporary);
        }
    }

    commitValidatedFile(target, temporary, backup) {
        const previousInfo = this.adapter.inspect(target);
        const hadPrevious = previousInfo.exists;

        if (hadPrevious) {
            this.adapter.move(target, backup);
        }

        try {
            this.adapter.move(temporary, target);

            const committedInfo = this.adapter.inspect(target);
            if (!isValidMp3File(committedInfo, this.minimumBytes)) {
                throw new Error(
                    'O arquivo movido para o cache final é inválido'
                );
            }

            if (hadPrevious) {
                this.adapter.remove(backup);
            }

            return committedInfo;
        } catch (error) {
            this.adapter.remove(target);

            if (hadPrevious && this.adapter.inspect(backup).exists) {
                this.adapter.move(backup, target);
            }

            throw error;
        }
    }

    remove(audioPath) {
        const key = this.adapter.cacheKey(audioPath);
        const target = this.adapter.finalPath(key);
        const activeDownload = this.inFlight.get(key)?.promise;

        this.bumpGeneration(key);
        this.adapter.remove(target);

        if (!activeDownload) {
            return Promise.resolve();
        }

        return activeDownload
            .catch(() => undefined)
            .then(() => {
                this.adapter.remove(target);
            });
    }
}

module.exports = {
    AudioCacheManager,
    AudioDownloadCancelledError,
    DEFAULT_MINIMUM_MP3_BYTES,
    hasId3Header,
    hasMpegFrameHeader,
    isValidMp3File,
};
