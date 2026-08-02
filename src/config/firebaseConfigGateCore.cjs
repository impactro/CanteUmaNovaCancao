const assert = require('node:assert/strict');
const fs = require('node:fs');

const EXPECTED_ANDROID_PACKAGE = 'br.org.icoc.novacancao';

function validateFirebaseConfig(
    config,
    expectedPackage = EXPECTED_ANDROID_PACKAGE
) {
    const matchingClients = (config.client || []).filter(
        client =>
            client.client_info?.android_client_info?.package_name ===
            expectedPackage
    );

    assert.equal(
        matchingClients.length,
        1,
        `google-services.json deve conter exatamente um cliente ${expectedPackage}`
    );

    const matchingClient = matchingClients[0];
    assert.match(
        matchingClient.client_info?.mobilesdk_app_id || '',
        /^1:\d+:android:[a-f0-9]+$/u,
        'mobilesdk_app_id Android ausente ou inválido'
    );
    assert.equal(
        Array.isArray(matchingClient.api_key) &&
            matchingClient.api_key.some(
                entry => /^AIza[\w-]+$/u.test(entry.current_key || '')
            ),
        true,
        'API key Firebase ausente ou inválida'
    );
    assert.match(
        config.project_info?.project_id || '',
        /^[a-z0-9][a-z0-9-]+$/u,
        'project_id Firebase ausente ou inválido'
    );

    return {
        client: matchingClient,
        packageName: expectedPackage,
        projectId: config.project_info.project_id,
    };
}

function validateFirebaseConfigFile(
    configPath,
    expectedPackage = EXPECTED_ANDROID_PACKAGE
) {
    if (!fs.existsSync(configPath)) {
        throw new Error(
            `ausente ${configPath}; forneça o arquivo real de ${expectedPackage}`
        );
    }

    let config;

    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        throw new Error(`JSON inválido em ${configPath}: ${error.message}`);
    }

    return validateFirebaseConfig(config, expectedPackage);
}

module.exports = {
    EXPECTED_ANDROID_PACKAGE,
    validateFirebaseConfig,
    validateFirebaseConfigFile,
};
