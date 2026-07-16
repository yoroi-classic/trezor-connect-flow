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

function assertWorkflowActionsPinned(filePath, source) {
  for (const line of source.split('\n')) {
    const match = line.match(/^\s+uses:\s+([^\s#]+)(?:\s+#\s*(\S+))?$/);

    if (!match) {
      continue;
    }

    const [, action, versionComment] = match;
    const [, ref] = action.match(/@([^@]+)$/) || [];

    assert.match(ref || '', /^[a-f0-9]{40}$/, `${filePath} must pin ${action} to a full commit SHA`);
    assert.match(
      versionComment || '',
      /^v\d+\.\d+\.\d+$/,
      `${filePath} must document the reviewed upstream version for ${action}`
    );
  }
}

const packageJson = readJson('package.json');
const packageLock = readJson('package-lock.json');
const npmrc = fs.readFileSync(path.join(root, '.npmrc'), 'utf8');
const nvmrc = fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim();
const dependabot = fs.readFileSync(path.join(root, '.github', 'dependabot.yml'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'test.yml'), 'utf8');
const dependencyReviewWorkflow = fs.readFileSync(
  path.join(root, '.github', 'workflows', 'dependency-review.yml'),
  'utf8'
);
const npmVersion = parsePackageManager(packageJson.packageManager);
const actualNodeMajor = Number(process.versions.node.split('.')[0]);
const actualNpmVersion = currentNpmVersion();
const expectedEngines = {
  node: '^22 || ^24',
  npm: '>=10',
};
const expectedDevEngines = {
  runtime: {
    name: 'node',
    version: expectedEngines.node,
    onFail: 'error',
  },
  packageManager: {
    name: 'npm',
    version: expectedEngines.npm,
    onFail: 'error',
  },
};

assert.deepEqual(packageJson.engines, expectedEngines);
assert.deepEqual(packageJson.devEngines, expectedDevEngines);
assert.equal(packageLock.lockfileVersion, 3);
const lockfileRootPackage = packageLock.packages[''];

assert.equal(lockfileRootPackage.name, packageJson.name);
assert.equal(lockfileRootPackage.version, packageJson.version);
assert.deepEqual(lockfileRootPackage.dependencies, packageJson.dependencies);
assert.deepEqual(lockfileRootPackage.devDependencies, packageJson.devDependencies);
assert.deepEqual(lockfileRootPackage.engines, expectedEngines);
assert.equal(nvmrc, '22');
assert.match(npmrc, /^engine-strict=true$/m);
assert.ok([22, 24].includes(actualNodeMajor), `Node ${process.versions.node} is outside the CI matrix`);
assert.equal(actualNpmVersion, npmVersion);
assert.equal(packageJson.scripts.lint, 'eslint .');
assert.match(packageJson.scripts.verify, /npm run lint/);
assert.match(workflow, /^\s+- 22\.x$/m);
assert.match(workflow, /^\s+- 24\.x$/m);
assert.match(workflow, new RegExp(`npm install --global npm@${npmVersion.replaceAll('.', '\\.')}`));
assert.match(workflow, /npm run check:toolchain/);
assert.match(workflow, /npm ci --ignore-scripts/);
assert.match(workflow, /npm run verify/);
assert.ok(
  workflow.indexOf('npm ci') < workflow.indexOf('npm run verify'),
  'CI must install dependencies before running package verification'
);
assert.match(dependabot, /package-ecosystem: npm/);
assert.match(dependabot, /directory: "\/"/);
assert.match(dependencyReviewWorkflow, /^\s+- package\.json$/m);
assert.match(dependencyReviewWorkflow, /^\s+- package-lock\.json$/m);
assert.match(dependencyReviewWorkflow, /fail-on-severity: high/);
assertWorkflowActionsPinned('.github/workflows/test.yml', workflow);
assertWorkflowActionsPinned('.github/workflows/dependency-review.yml', dependencyReviewWorkflow);
