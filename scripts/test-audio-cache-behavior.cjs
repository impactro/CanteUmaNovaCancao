const assert = require('node:assert/strict');
const {
    AudioCacheManager,
    AudioDownloadCancelledError,
    DEFAULT_MINIMUM_MP3_BYTES,
    isValidMp3File,
} = require('../src/service/audioCacheCore.cjs');

function id3Bytes(size = DEFAULT_MINIMUM_MP3_BYTES + 32, marker = 0x01) {
    const bytes = new Uint8Array(size);
    bytes.set([0x49, 0x44, 0x33, marker], 0);
    return bytes;
}

function mpegBytes(size = DEFAULT_MINIMUM_MP3_BYTES + 32) {
    const bytes = new Uint8Array(size);
    bytes.set([0xff, 0xfb, 0x90, 0x64], 0);
    return bytes;
}

function invalidBytes(size = DEFAULT_MINIMUM_MP3_BYTES + 32) {
    return new Uint8Array(size);
}

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });

    return { promise, reject, resolve };
}

class FakeAdapter {
    constructor() {
        this.files = new Map();
        this.downloadCalls = 0;
        this.downloadDestinations = [];
        this.downloadPlans = [];
        this.moveFailure = null;
        this.operationId = 0;
        this.removeCalls = [];
    }

    cacheKey(audioPath) {
        return `key:${audioPath}`;
    }

    finalPath(key) {
        return `final:${key}`;
    }

    temporaryPath(key, operationId) {
        return `temporary:${key}:${operationId}`;
    }

    backupPath(key, operationId) {
        return `backup:${key}:${operationId}`;
    }

    createOperationId() {
        this.operationId += 1;
        return `fake-${this.operationId}`;
    }

    prepareWrite() {}

    inspect(uri) {
        const bytes = this.files.get(uri);

        return {
            exists: Boolean(bytes),
            header: bytes ? bytes.slice(0, 4) : new Uint8Array(),
            size: bytes?.length || 0,
            uri,
        };
    }

    seed(uri, bytes) {
        this.files.set(uri, bytes.slice());
    }

    bytes(uri) {
        return this.files.get(uri);
    }

    remove(uri) {
        this.removeCalls.push(uri);
        this.files.delete(uri);
    }

    move(fromUri, toUri) {
        if (this.moveFailure?.(fromUri, toUri)) {
            this.moveFailure = null;
            throw new Error('Falha simulada durante move');
        }

        const bytes = this.files.get(fromUri);
        if (!bytes) {
            throw new Error(`Origem inexistente: ${fromUri}`);
        }

        this.files.set(toUri, bytes);
        this.files.delete(fromUri);
    }

    queueDownload(plan) {
        this.downloadPlans.push(plan);
    }

    async download(remoteUrl, temporaryUri) {
        this.downloadCalls += 1;
        this.downloadDestinations.push(temporaryUri);
        const plan = this.downloadPlans.shift();

        if (!plan) {
            throw new Error('Download sem plano no fake');
        }

        await plan({
            adapter: this,
            remoteUrl,
            temporaryUri,
        });
    }
}

function immediateDownload(bytes) {
    return async ({ adapter, temporaryUri }) => {
        adapter.seed(temporaryUri, bytes);
    };
}

function deferredDownload(control, bytes) {
    return async ({ adapter, temporaryUri }) => {
        await control.promise;
        adapter.seed(temporaryUri, bytes);
    };
}

async function run() {
    assert.equal(DEFAULT_MINIMUM_MP3_BYTES, 16 * 1024);
    assert.equal(
        isValidMp3File({
            exists: true,
            header: id3Bytes(4),
            size: DEFAULT_MINIMUM_MP3_BYTES,
        }),
        true
    );
    assert.equal(
        isValidMp3File({
            exists: true,
            header: mpegBytes(4),
            size: DEFAULT_MINIMUM_MP3_BYTES,
        }),
        true
    );
    assert.equal(
        isValidMp3File({
            exists: true,
            header: invalidBytes(4),
            size: DEFAULT_MINIMUM_MP3_BYTES,
        }),
        false
    );

    {
        const adapter = new FakeAdapter();
        const manager = new AudioCacheManager(adapter);
        const path = 'audio/read.mp3';
        const key = adapter.cacheKey(path);
        const final = adapter.finalPath(key);
        const staleTemporary = adapter.temporaryPath(key, 'stale');
        adapter.seed(final, id3Bytes(100));
        adapter.seed(staleTemporary, id3Bytes());

        assert.equal(manager.getCachedUri(path), null);
        assert.equal(adapter.files.has(final), true);
        assert.equal(adapter.files.has(staleTemporary), true);
        assert.equal(adapter.removeCalls.length, 0);
    }

    {
        const adapter = new FakeAdapter();
        const manager = new AudioCacheManager(adapter);
        const control = deferred();
        const path = 'audio/deduplicated.mp3';
        adapter.queueDownload(deferredDownload(control, id3Bytes()));

        const first = manager.download(path, 'https://cdn/audio.mp3');
        const second = manager.download(path, 'https://cdn/audio.mp3');

        assert.equal(first, second);
        assert.equal(adapter.downloadCalls, 1);
        control.resolve();
        const [firstUri, secondUri] = await Promise.all([first, second]);
        assert.equal(firstUri, secondUri);
        assert.equal(adapter.downloadCalls, 1);
    }

    {
        const adapter = new FakeAdapter();
        const manager = new AudioCacheManager(adapter);
        const path = 'audio/partial.mp3';
        const final = adapter.finalPath(adapter.cacheKey(path));
        const previous = id3Bytes(undefined, 0x10);
        adapter.seed(final, previous);
        adapter.queueDownload(async ({ adapter: fake, temporaryUri }) => {
            fake.seed(temporaryUri, id3Bytes(200));
            throw new Error('Falha parcial de rede');
        });

        await assert.rejects(
            manager.download(path, 'https://cdn/partial.mp3'),
            /Falha parcial/
        );
        assert.deepEqual(adapter.bytes(final), previous);
        assert.equal(
            [...adapter.files.keys()].some(uri => uri.startsWith('temporary:')),
            false
        );
    }

    {
        const adapter = new FakeAdapter();
        const manager = new AudioCacheManager(adapter);
        const path = 'audio/invalid.mp3';
        const final = adapter.finalPath(adapter.cacheKey(path));
        const previous = mpegBytes();
        adapter.seed(final, previous);
        adapter.queueDownload(immediateDownload(invalidBytes()));

        await assert.rejects(
            manager.download(path, 'https://cdn/invalid.mp3'),
            /MP3 íntegro/
        );
        assert.deepEqual(adapter.bytes(final), previous);
    }

    {
        const adapter = new FakeAdapter();
        const manager = new AudioCacheManager(adapter);
        const path = 'audio/swap.mp3';
        const final = adapter.finalPath(adapter.cacheKey(path));
        const previous = id3Bytes(undefined, 0x20);
        adapter.seed(final, previous);
        adapter.queueDownload(immediateDownload(id3Bytes(undefined, 0x30)));
        adapter.moveFailure = (fromUri, toUri) =>
            fromUri.startsWith('temporary:') && toUri === final;

        await assert.rejects(
            manager.download(path, 'https://cdn/swap.mp3'),
            /Falha simulada/
        );
        assert.deepEqual(adapter.bytes(final), previous);
        assert.equal(
            [...adapter.files.keys()].some(uri => uri.startsWith('backup:')),
            false
        );
    }

    {
        const adapter = new FakeAdapter();
        const manager = new AudioCacheManager(adapter);
        const control = deferred();
        const path = 'audio/remove-during-download.mp3';
        const key = adapter.cacheKey(path);
        const final = adapter.finalPath(key);
        adapter.seed(final, id3Bytes());
        adapter.queueDownload(deferredDownload(control, mpegBytes()));

        const downloadPromise = manager.download(
            path,
            'https://cdn/remove.mp3'
        );
        const removalPromise = manager.remove(path);

        assert.equal(adapter.files.has(final), false);
        control.resolve();
        await assert.rejects(
            downloadPromise,
            error => error instanceof AudioDownloadCancelledError
        );
        await removalPromise;
        assert.equal(
            [...adapter.files.keys()].some(uri => uri.includes(key)),
            false
        );
    }

    {
        const adapter = new FakeAdapter();
        const manager = new AudioCacheManager(adapter);
        const path = 'audio/exclusive-temp.mp3';
        adapter.queueDownload(async () => {
            throw new Error('Primeira tentativa falhou');
        });
        adapter.queueDownload(immediateDownload(id3Bytes()));

        await assert.rejects(
            manager.download(path, 'https://cdn/one.mp3'),
            /Primeira tentativa/
        );
        await manager.download(path, 'https://cdn/two.mp3');

        assert.equal(adapter.downloadDestinations.length, 2);
        assert.notEqual(
            adapter.downloadDestinations[0],
            adapter.downloadDestinations[1]
        );
    }

    console.log(
        'Audio cache behavior passed: integrity, read-only lookup, ' +
        'deduplication, partial failure, rollback, safe removal and unique temp.'
    );
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
