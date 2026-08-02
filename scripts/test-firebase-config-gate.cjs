const assert = require('node:assert/strict');
const path = require('node:path');
const {
    EXPECTED_ANDROID_PACKAGE,
    validateFirebaseConfig,
    validateFirebaseConfigFile,
} = require('../src/config/firebaseConfigGateCore.cjs');

function fakeConfig(packageName) {
    return {
        project_info: {
            project_id: 'cante-uma-nova-cancao',
        },
        client: [
            {
                client_info: {
                    mobilesdk_app_id: '1:123456789:android:abcdef0123456789',
                    android_client_info: {
                        package_name: packageName,
                    },
                },
                api_key: [
                    {
                        current_key: 'AIzaFakeKeyUsedOnlyByTheGateTest',
                    },
                ],
            },
        ],
    };
}

assert.throws(
    () => validateFirebaseConfigFile(
        path.join(__dirname, '__fixture-does-not-exist__.json')
    ),
    /ausente/u,
    'O gate deve falhar sem google-services.json'
);

assert.throws(
    () => validateFirebaseConfig(fakeConfig('org.example.wrong')),
    new RegExp(EXPECTED_ANDROID_PACKAGE.replaceAll('.', '\\.'), 'u'),
    'O gate deve falhar quando o package Android estiver errado'
);

const validResult = validateFirebaseConfig(
    fakeConfig(EXPECTED_ANDROID_PACKAGE)
);
assert.equal(validResult.packageName, EXPECTED_ANDROID_PACKAGE);

console.log(
    'Firebase gate behavior passed: missing and wrong-package configs fail.'
);
