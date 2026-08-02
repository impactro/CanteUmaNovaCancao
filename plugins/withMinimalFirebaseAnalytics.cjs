const { withAndroidManifest } = require('@expo/config-plugins');

function setApplicationMetaData(application, name, value) {
    const entries = application['meta-data'] || [];
    const existing = entries.find(entry => entry.$?.['android:name'] === name);
    const attributes = {
        'android:name': name,
        'android:value': String(value),
    };

    if (existing) {
        existing.$ = attributes;
    } else {
        entries.push({ $: attributes });
    }

    application['meta-data'] = entries;
}

module.exports = function withMinimalFirebaseAnalytics(config) {
    return withAndroidManifest(config, configWithManifest => {
        const application =
            configWithManifest.modResults.manifest.application?.[0];

        if (!application) {
            throw new Error('AndroidManifest sem elemento application');
        }

        const privacyDefaults = {
            firebase_analytics_collection_enabled: true,
            google_analytics_adid_collection_enabled: false,
            google_analytics_ssaid_collection_enabled: false,
            google_analytics_automatic_screen_reporting_enabled: false,
            google_analytics_default_allow_analytics_storage: true,
            google_analytics_default_allow_ad_storage: false,
            google_analytics_default_allow_ad_user_data: false,
            google_analytics_default_allow_ad_personalization_signals: false,
        };

        for (const [name, value] of Object.entries(privacyDefaults)) {
            setApplicationMetaData(application, name, value);
        }

        return configWithManifest;
    });
};
