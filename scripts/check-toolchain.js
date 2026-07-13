const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function parsePackageManager(value) {
  const [name, version] = value.split('@');

  assert.equal(name, 'npm', 'packageManager must pin npm');
  assert.match(version, /^\d+\.\d+\.\d+$/, 'packageManager must pin an exact npm version');

  return version;
}

function currentNpmVersion() {
  const match = (process.env.npm_config_user_agent || '').match(/\bnpm\/(\d+\.\d+\.\d+)\b/);

  assert.ok(match, 'check:toolchain must be run through npm so the npm version can be verified');

  return match[1];
}

const packageJson = readJson('package.json');
const packageLock = readJson('package-lock.json');
const npmrc = fs.readFileSync(path.join(root, '.npmrc'), 'utf8');
const nvmrc = fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim();
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'test.yml'), 'utf8');
const npmVersion = parsePackageManager(packageJson.packageManager);
const actualNodeMajor = Number(process.versions.node.split('.')[0]);
const actualNpmVersion = currentNpmVersion();
const expectedEngines = {
  node: '>=22 <23 || >=24 <25',
  npm: '>=10',
};

assert.deepEqual(packageJson.engines, expectedEngines);
assert.deepEqual(packageLock.packages[''].engines, expectedEngines);
assert.equal(nvmrc, '22');
assert.match(npmrc, /^engine-strict=true$/m);
assert.ok([22, 24].includes(actualNodeMajor), `Node ${process.versions.node} is outside the CI matrix`);
assert.equal(actualNpmVersion, npmVersion);
assert.match(workflow, /^\s+- 22\.x$/m);
assert.match(workflow, /^\s+- 24\.x$/m);
assert.match(workflow, new RegExp(`npm install --global npm@${npmVersion.replaceAll('.', '\\.')}`));
assert.match(workflow, /npm run check:toolchain/);
