const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const packageJson = JSON.parse(read('package.json'));
const appJson = JSON.parse(read('app.json'));
const firebaseJson = JSON.parse(read('firebase.json'));

assert.equal(packageJson.dependencies['@react-native-firebase/app'], '25.1.0');
assert.equal(packageJson.dependencies['@react-native-firebase/analytics'], '25.1.0');

const firebaseDependencies = Object.keys(packageJson.dependencies)
    .filter(name => name.startsWith('@react-native-firebase/'))
    .sort();
assert.deepEqual(firebaseDependencies, [
    '@react-native-firebase/analytics',
    '@react-native-firebase/app',
]);

assert.equal(appJson.expo.android.package, 'br.org.icoc.novacancao');
assert.equal(appJson.expo.android.googleServicesFile, './google-services.json');
for (const blockedAdvertisingPermission of [
    'com.google.android.gms.permission.AD_ID',
    'android.permission.ACCESS_ADSERVICES_AD_ID',
    'android.permission.ACCESS_ADSERVICES_ATTRIBUTION',
]) {
    assert.equal(
        appJson.expo.android.blockedPermissions.includes(
            blockedAdvertisingPermission
        ),
        true,
        `Permissão de publicidade deve estar bloqueada: ${blockedAdvertisingPermission}`
    );
}
assert.equal(appJson.expo.plugins.includes('@react-native-firebase/app'), true);
assert.equal(
    appJson.expo.plugins.includes('./plugins/withMinimalFirebaseAnalytics.cjs'),
    true
);

const analyticsPlugin = appJson.expo.plugins.find(
    plugin => Array.isArray(plugin) &&
        plugin[0] === '@react-native-firebase/analytics'
);
assert.ok(analyticsPlugin);
assert.equal(analyticsPlugin[1].ios.withoutAdIdSupport, true);

const expectedFirebasePrivacy = {
    analytics_auto_collection_enabled: true,
    google_analytics_adid_collection_enabled: false,
    google_analytics_ssaid_collection_enabled: false,
    google_analytics_automatic_screen_reporting_enabled: false,
    analytics_default_allow_analytics_storage: true,
    analytics_default_allow_ad_storage: false,
    analytics_default_allow_ad_user_data: false,
    analytics_default_allow_ad_personalization_signals: false,
};
assert.deepEqual(firebaseJson['react-native'], expectedFirebasePrivacy);

const rnFirebaseSchema = JSON.parse(
    read('node_modules/@react-native-firebase/app/firebase-schema.json')
);
const supportedFirebaseOptions =
    rnFirebaseSchema.properties['react-native'].properties;

for (const optionName of Object.keys(expectedFirebasePrivacy)) {
    assert.ok(
        supportedFirebaseOptions[optionName],
        `Opção sem suporte no RNFirebase 25.1.0: ${optionName}`
    );
}

const rnFirebaseAnalyticsGradle = read(
    'node_modules/@react-native-firebase/analytics/android/build.gradle'
);
const rnFirebaseAnalyticsManifest = read(
    'node_modules/@react-native-firebase/analytics/android/src/main/AndroidManifest.xml'
);
for (const optionName of Object.keys(expectedFirebasePrivacy)) {
    assert.equal(
        rnFirebaseAnalyticsGradle.includes(`'${optionName}'`),
        true,
        `Gradle RNFirebase não consome ${optionName}`
    );
}
for (const manifestName of [
    'firebase_analytics_collection_enabled',
    'google_analytics_adid_collection_enabled',
    'google_analytics_ssaid_collection_enabled',
    'google_analytics_automatic_screen_reporting_enabled',
    'google_analytics_default_allow_analytics_storage',
    'google_analytics_default_allow_ad_storage',
    'google_analytics_default_allow_ad_user_data',
    'google_analytics_default_allow_ad_personalization_signals',
]) {
    assert.equal(rnFirebaseAnalyticsManifest.includes(manifestName), true);
}

const manifestPlugin = read('plugins/withMinimalFirebaseAnalytics.cjs');
for (const requiredManifestSetting of [
    'firebase_analytics_collection_enabled',
    'google_analytics_adid_collection_enabled',
    'google_analytics_ssaid_collection_enabled',
    'google_analytics_automatic_screen_reporting_enabled',
    'google_analytics_default_allow_analytics_storage',
    'google_analytics_default_allow_ad_storage',
    'google_analytics_default_allow_ad_user_data',
    'google_analytics_default_allow_ad_personalization_signals',
]) {
    assert.equal(manifestPlugin.includes(requiredManifestSetting), true);
}

const analyticsSource = read('src/service/analytics.js');
for (const requiredAnalyticsSource of [
    "ANALYTICS_STREAM_ID = '2088146498'",
    'logScreenView',
    "'music_play'",
    'music_id: String(track.number)',
    'music_title: track.title',
    'catalog.find',
]) {
    assert.equal(analyticsSource.includes(requiredAnalyticsSource), true);
}
for (const forbiddenAnalyticsSource of [
    'setUserId',
    'setUserProperty',
    'setUserProperties',
    'logSearch',
    'initiateOnDeviceConversion',
]) {
    assert.equal(analyticsSource.includes(forbiddenAnalyticsSource), false);
}

const routerSource = read('src/routes/router.js');
assert.equal(routerSource.includes('trackScreenRoute'), true);
assert.equal(routerSource.includes('onReady={trackCurrentScreen}'), true);
assert.equal(routerSource.includes('onStateChange={trackCurrentScreen}'), true);

const musicSource = read('src/components/Music/index.js');
assert.equal(
    musicSource.includes('MusicPlayExecutionTracker'),
    true
);
assert.equal(musicSource.includes('trackMusicPlay(numMusic)'), true);
assert.equal(musicSource.includes('playbackFinished()'), true);

for (const scriptName of [
    'android',
    'prebuild',
    'build:android',
    'build:apk',
    'build:dev-android',
    'prebuild:android',
    'build:android-local:apk',
    'build:android-local:aab',
    'build:android-develop-apk',
    'build:android-apk',
]) {
    assert.equal(
        packageJson.scripts[scriptName].includes('gate:firebase'),
        true,
        `${scriptName} deve executar gate:firebase`
    );
}

const legalSource =
    read('src/components/TermsOfUse/index.js') +
    read('src/components/PrivacyPolicy/index.js');
for (const requiredLegalText of [
    'Google Analytics for Firebase',
    'telas abertas',
    'músicas reproduzidas',
    'não são vendidos',
    'localização aproximada derivada da rede',
]) {
    assert.equal(legalSource.includes(requiredLegalText), true);
}

const googleServicesPath = path.join(root, 'google-services.json');

if (fs.existsSync(googleServicesPath)) {
    const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
    const matchingClient = googleServices.client?.find(
        client =>
            client.client_info?.android_client_info?.package_name ===
            'br.org.icoc.novacancao'
    );

    assert.ok(
        matchingClient,
        'google-services.json não contém br.org.icoc.novacancao'
    );
    console.log('Firebase config presente e package Android validado.');
} else {
    console.log(
        'Firebase config pendente: forneça google-services.json para ' +
        'br.org.icoc.novacancao antes do prebuild/build.'
    );
}

console.log('Minimal Firebase Analytics checks passed.');
