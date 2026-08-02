const assert = require('node:assert/strict');
const {
    injectAndroidReleaseSigning,
    PLUGIN_MARKER,
} = require('../plugins/withAndroidReleaseSigning.cjs');

const generatedBuildGradle = `
android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Generated Expo default.
            signingConfig signingConfigs.debug
            minifyEnabled false
        }
    }
}
`;

const transformed = injectAndroidReleaseSigning(generatedBuildGradle);

assert.equal(
    transformed.split(PLUGIN_MARKER).length - 1,
    1,
    'the release-signing environment block must be injected once'
);
assert.match(
    transformed,
    /ANDROID_UPLOAD_KEYSTORE/,
    'the keystore path must come from the environment'
);
assert.match(
    transformed,
    /ANDROID_UPLOAD_KEY_ALIAS/,
    'the key alias must come from the environment'
);
assert.match(
    transformed,
    /ANDROID_UPLOAD_STORE_PASSWORD/,
    'the store password must come from the environment'
);
assert.match(
    transformed,
    /ANDROID_UPLOAD_KEY_PASSWORD/,
    'the key password must come from the environment'
);
assert.match(
    transformed,
    /release\s*\{[\s\S]*signingConfig signingConfigs\.release/,
    'release builds must use the release signing config'
);
assert.match(
    transformed,
    /debug\s*\{[\s\S]*signingConfig signingConfigs\.debug/,
    'debug builds must keep the generated debug signing config'
);
assert.match(
    transformed,
    /it\.name == "bundleRelease"/,
    'bundleRelease must validate the release-signing environment'
);
assert.equal(
    injectAndroidReleaseSigning(transformed),
    transformed,
    'the config plugin transformation must be idempotent'
);

assert.throws(
    () => injectAndroidReleaseSigning('android { buildTypes { release { } } }'),
    /signingConfigs/,
    'a changed Expo build.gradle shape must fail instead of silently skipping signing'
);

console.log('Android release signing plugin behavior: OK');
