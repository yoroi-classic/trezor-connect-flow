const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));

const cslPackages = [
  '@emurgo/cardano-serialization-lib-browser',
  '@emurgo/cardano-serialization-lib-nodejs',
];

function dependencyNames(dependencies = {}) {
  return Object.keys(dependencies);
}

function collectOverrideKeys(overrides = {}) {
  return Object.entries(overrides).flatMap(([packageName, override]) => [
    packageName,
    ...(override && typeof override === 'object' ? collectOverrideKeys(override) : []),
  ]);
}

function matchesPackageName(packageName, dependency) {
  return packageName === dependency || packageName.startsWith(`${dependency}@`);
}

test('does not declare CSL directly', () => {
  const declared = [
    ...dependencyNames(packageJson.dependencies),
    ...dependencyNames(packageJson.devDependencies),
    ...dependencyNames(packageJson.peerDependencies),
    ...dependencyNames(packageJson.optionalDependencies),
  ];

  assert.deepEqual(
    declared.filter((dependency) => cslPackages.includes(dependency)),
    []
  );
});

test('does not alias CSL through package-manager overrides', () => {
  const overrideKeys = [
    ...collectOverrideKeys(packageJson.overrides),
    ...collectOverrideKeys(packageJson.resolutions),
  ];

  assert.deepEqual(
    overrideKeys.filter((packageName) =>
      cslPackages.some((dependency) => matchesPackageName(packageName, dependency))
    ),
    []
  );
});

test('keeps lockfile CSL references isolated to the known coin-selection dependency', () => {
  const packages = packageLock.packages || {};
  const allowedDependentPaths = ['node_modules/@fivebinaries/coin-selection'];
  const cslDependents = Object.entries(packages)
    .filter(([, metadata]) =>
      dependencyNames(metadata.dependencies).some((dependency) => cslPackages.includes(dependency))
    )
    .map(([packagePath]) => packagePath);

  assert.deepEqual(
    cslDependents.filter((packagePath) => !allowedDependentPaths.includes(packagePath)),
    []
  );

  const cslEntries = Object.keys(packages).filter((packagePath) =>
    cslPackages.some((dependency) => packagePath.endsWith(`node_modules/${dependency}`))
  );
  const allowedEntries = cslPackages.map((dependency) => `node_modules/${dependency}`);

  assert.deepEqual(
    cslEntries.filter((packagePath) => !allowedEntries.includes(packagePath)),
    []
  );
});
