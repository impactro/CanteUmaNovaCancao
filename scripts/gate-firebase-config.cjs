const path = require('node:path');
const {
    validateFirebaseConfigFile,
} = require('../src/config/firebaseConfigGateCore.cjs');

const configPath = path.resolve(__dirname, '..', 'google-services.json');

try {
    const result = validateFirebaseConfigFile(configPath);
    console.log(
        `Firebase gate passed: package ${result.packageName}, ` +
        `projeto ${result.projectId}.`
    );
} catch (error) {
    console.error(`Firebase gate failed: ${error.message}`);
    process.exit(1);
}
