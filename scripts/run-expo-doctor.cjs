const { spawnSync } = require('node:child_process');

const isWindows = process.platform === 'win32';
const executable = isWindows ? process.env.ComSpec : 'npx';
const args = isWindows
    ? ['/d', '/s', '/c', 'npx --no-install expo-doctor --verbose']
    : ['--no-install', 'expo-doctor', '--verbose'];
const result = spawnSync(executable, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
    timeout: 180000
});
const output = `${result.stdout || ''}${result.stderr || ''}`;

process.stdout.write(output);

if (result.error) {
    console.error(result.error.message);
    process.exit(1);
}

if (result.status === 0) {
    process.exit(0);
}

const summary = output.match(/(\d+)\/(\d+) checks passed/u);
const failures = summary ? Number(summary[2]) - Number(summary[1]) : null;
const hasExplicitConfigPluginsException =
    output.includes('packages that should not be installed directly') &&
    output.includes('@expo/config-plugins');
const hasExpoApiNetworkException =
    output.includes("Unexpected error while running 'Check Expo config (app.json/ app.config.js) schema' check") &&
    output.includes('TypeError: fetch failed');
const acceptedFailures =
    Number(hasExplicitConfigPluginsException) + Number(hasExpoApiNetworkException);

if (failures !== null && failures === acceptedFailures) {
    if (hasExplicitConfigPluginsException) {
        console.log(
            'Expo Doctor exception accepted: @expo/config-plugins is an explicit direct dependency for the local config plugins.'
        );
    }
    if (hasExpoApiNetworkException) {
        console.log(
            'Expo Doctor network notice accepted: the Expo API schema check was unavailable; all local checks still ran.'
        );
    }
    process.exit(0);
}

process.exit(result.status || 1);
