const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const intermediates = path.join(root, 'android', 'app', 'build', 'intermediates');

function findManifests(directory) {
    if (!fs.existsSync(directory)) {
        return [];
    }

    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            return findManifests(entryPath);
        }

        return entry.name === 'AndroidManifest.xml' ? [entryPath] : [];
    });
}

const candidates = findManifests(intermediates)
    .filter(filePath =>
        /merged_manifest|merged_manifests|packaged_manifests/iu.test(filePath)
    )
    .sort(
        (left, right) =>
            fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs
    );

assert.ok(
    candidates.length,
    'Manifest mesclado não encontrado; execute o build Android primeiro'
);

const manifestPath = candidates[0];
const manifest = fs.readFileSync(manifestPath, 'utf8');
const metadata = new Map();
for (const tagMatch of manifest.matchAll(/<meta-data\b[^>]*\/?>/gu)) {
    const name = tagMatch[0].match(/android:name="([^"]+)"/u)?.[1];
    const value = tagMatch[0].match(/android:value="([^"]+)"/u)?.[1];

    if (name && value !== undefined) {
        metadata.set(name, value);
    }
}

const expectedMetadata = {
    firebase_analytics_collection_enabled: 'true',
    google_analytics_adid_collection_enabled: 'false',
    google_analytics_ssaid_collection_enabled: 'false',
    google_analytics_automatic_screen_reporting_enabled: 'false',
    google_analytics_default_allow_analytics_storage: 'true',
    google_analytics_default_allow_ad_storage: 'false',
    google_analytics_default_allow_ad_user_data: 'false',
    google_analytics_default_allow_ad_personalization_signals: 'false',
};

for (const [name, value] of Object.entries(expectedMetadata)) {
    assert.equal(metadata.get(name), value, `${name} deve ser ${value}`);
}

for (const forbiddenPermission of [
    'com.google.android.gms.permission.AD_ID',
    'android.permission.ACCESS_ADSERVICES_AD_ID',
    'android.permission.ACCESS_ADSERVICES_ATTRIBUTION',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.RECORD_AUDIO',
    'android.permission.WRITE_EXTERNAL_STORAGE',
]) {
    assert.equal(
        manifest.includes(
            `<uses-permission android:name="${forbiddenPermission}"`
        ),
        false,
        `Permissão proibida no manifest: ${forbiddenPermission}`
    );
}

for (const requiredPermission of [
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
]) {
    assert.equal(
        manifest.includes(
            `<uses-permission android:name="${requiredPermission}"`
        ),
        true,
        `Permissão de playback ausente: ${requiredPermission}`
    );
}

console.log(`Android privacy manifest passed: ${manifestPath}`);
