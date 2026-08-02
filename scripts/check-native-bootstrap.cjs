const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(
  projectRoot,
  '.agents',
  'dev',
  'native-bootstrap-regression'
);

fs.rmSync(outputDir, { recursive: true, force: true });

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const exportResult = spawnSync(
  npx,
  [
    'expo',
    'export',
    '--platform',
    'android',
    '--output-dir',
    outputDir,
    '--no-bytecode',
    '--no-minify',
    '--source-maps',
    '--max-workers',
    '2',
  ],
  {
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'production' },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  }
);

if (exportResult.status !== 0) {
  process.exit(exportResult.status ?? 1);
}

function findSourceMap(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedMap = findSourceMap(entryPath);
      if (nestedMap) return nestedMap;
    } else if (entry.name.endsWith('.js.map')) {
      return entryPath;
    }
  }

  return null;
}

const sourceMapPath = findSourceMap(outputDir);

if (!sourceMapPath) {
  throw new Error('Android source map was not generated.');
}

const sourceMap = JSON.parse(fs.readFileSync(sourceMapPath, 'utf8'));
const normalizedSources = sourceMap.sources.map((source) =>
  source.replaceAll('\\', '/')
);
const webOnlyModules = normalizedSources.filter(
  (source) =>
    source.includes('/framer-motion/') ||
    source.includes('/@motionone/dom/') ||
    source.includes('/react-dom/') ||
    (
      source.includes('/node_modules/styled-components/') &&
      !source.includes('/node_modules/styled-components/native/')
    )
);
const nativeStyledModules = normalizedSources.filter((source) =>
  source.includes('/node_modules/styled-components/native/')
);
const unsafeNativeStyledModules = normalizedSources.flatMap((source, index) => {
  if (!source.includes('/node_modules/styled-components/native/')) return [];

  const sourceContent = sourceMap.sourcesContent[index] ?? '';
  const hasDOMAccess = /\bdocument\s*(?:\.|\[)/.test(sourceContent);
  const hasLegacyBrowserDetection =
    /typeof window\s*!==?\s*['"]undefined['"][\s\S]{0,120}HTMLElement/.test(
      sourceContent
    );

  return hasDOMAccess || hasLegacyBrowserDetection ? [source] : [];
});
const appDocumentReferences = normalizedSources.flatMap((source, index) => {
  if (source.includes('/node_modules/')) return [];

  const sourceContent = sourceMap.sourcesContent[index] ?? '';
  return /\bdocument\s*(?:\.|\[)/.test(sourceContent) ? [source] : [];
});

const applicationSourceRoots = [
  path.join(projectRoot, 'src'),
  path.join(projectRoot, 'App.js'),
  path.join(projectRoot, 'index.js'),
];
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
const bareStyledImports = [];

function inspectApplicationSource(sourcePath) {
  const sourceStat = fs.statSync(sourcePath);

  if (sourceStat.isDirectory()) {
    for (const entry of fs.readdirSync(sourcePath)) {
      inspectApplicationSource(path.join(sourcePath, entry));
    }
    return;
  }

  if (!sourceExtensions.has(path.extname(sourcePath))) return;

  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  const importsBareStyledComponents =
    /\bfrom\s+['"]styled-components['"]/.test(sourceContent) ||
    /\brequire\(\s*['"]styled-components['"]\s*\)/.test(sourceContent);

  if (importsBareStyledComponents) {
    bareStyledImports.push(path.relative(projectRoot, sourcePath));
  }
}

for (const sourceRoot of applicationSourceRoots) {
  inspectApplicationSource(sourceRoot);
}

if (
  webOnlyModules.length ||
  unsafeNativeStyledModules.length ||
  appDocumentReferences.length ||
  bareStyledImports.length ||
  nativeStyledModules.length === 0
) {
  console.error('Native bootstrap regression detected.');

  for (const source of webOnlyModules) {
    console.error(`Web-only module: ${source}`);
  }

  for (const source of unsafeNativeStyledModules) {
    console.error(`Unsafe styled-components native module: ${source}`);
  }

  for (const source of appDocumentReferences) {
    console.error(`Application DOM reference: ${source}`);
  }

  for (const source of bareStyledImports) {
    console.error(`Bare styled-components import: ${source}`);
  }

  if (nativeStyledModules.length === 0) {
    console.error('styled-components/native was not bundled.');
  }

  process.exit(1);
}

console.log(
  `Native bootstrap check passed (${sourceMap.sources.length} bundled modules, ` +
    `${nativeStyledModules.length} styled-components/native module).`
);
