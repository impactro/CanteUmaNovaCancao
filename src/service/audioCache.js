import { Directory, File, Paths } from 'expo-file-system';
import audioCatalog from './audioCatalog.cjs';
import audioCacheCore from './audioCacheCore.cjs';

const AUDIO_DIRECTORY_NAME = 'downloaded-audio';

function audioDirectory() {
    return new Directory(Paths.document, AUDIO_DIRECTORY_NAME);
}

function fileUri(fileName) {
    return new File(audioDirectory(), fileName).uri;
}

function fileAt(uri) {
    return new File(uri);
}

function inspectFile(uri) {
    const file = fileAt(uri);

    if (!file.exists) {
        return {
            exists: false,
            header: new Uint8Array(),
            size: 0,
            uri,
        };
    }

    try {
        const handle = file.open();

        try {
            return {
                exists: true,
                header: handle.readBytes(4),
                size: file.size,
                uri: file.uri,
            };
        } finally {
            handle.close();
        }
    } catch (error) {
        console.warn('Não foi possível inspecionar o cache de áudio:', error);

        return {
            exists: true,
            header: new Uint8Array(),
            size: Number(file.size) || 0,
            uri: file.uri,
        };
    }
}

function removeFile(uri) {
    const file = fileAt(uri);

    if (file.exists) {
        file.delete();
    }
}

const expoFileSystemAdapter = {
    cacheKey: audioCatalog.getAudioCacheFileName,

    finalPath(key) {
        return fileUri(key);
    },

    temporaryPath(key, operationId) {
        return fileUri(`${key}.${operationId}.part`);
    },

    backupPath(key, operationId) {
        return fileUri(`${key}.${operationId}.previous`);
    },

    createOperationId(counter) {
        const random = Math.random().toString(36).slice(2, 10);
        return `${Date.now().toString(36)}-${counter}-${random}`;
    },

    prepareWrite() {
        const directory = audioDirectory();

        if (!directory.exists) {
            directory.create({
                idempotent: true,
                intermediates: true,
            });
        }
    },

    inspect: inspectFile,
    remove: removeFile,

    move(fromUri, toUri) {
        fileAt(fromUri).move(fileAt(toUri));
    },

    async download(remoteUrl, temporaryUri) {
        await File.downloadFileAsync(
            remoteUrl,
            fileAt(temporaryUri),
            { idempotent: false }
        );
    },
};

const audioCache = new audioCacheCore.AudioCacheManager(
    expoFileSystemAdapter
);

export function getCachedAudioUri(audioPath) {
    return audioCache.getCachedUri(audioPath);
}

export function downloadAudio(audioPath) {
    return audioCache.download(
        audioPath,
        audioCatalog.resolveAudioUrl(audioPath)
    );
}

export function removeDownloadedAudio(audioPath) {
    return audioCache.remove(audioPath);
}
