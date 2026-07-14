const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));

const CSL_PACKAGE_NAME = /^@emurgo\/cardano-serialization-lib(?:-[a-z0-9]+)*$/;
const CSL_PACKAGE_SPECIFIER = /^npm:@emurgo\/cardano-serialization-lib(?:-[a-z0-9]+)*(?:@|$)/;
const CSL_TARBALL_URL = /\/@emurgo\/cardano-serialization-lib(?:-[a-z0-9]+)*\//;
const CML_PACKAGE_NAMES = [
  '@dcspark/cardano-multiplatform-lib-browser',
  '@dcspark/cardano-multiplatform-lib-nodejs',
];
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const allowedDependentPaths = ['node_modules/@fivebinaries/coin-selection'];

function dependencyNames(dependencies = {}) {
  return Object.keys(dependencies);
}

function dependencyReferences(dependencies = {}) {
  return Object.entries(dependencies).flatMap(([packageName, specifier]) => [packageName, specifier]);
}

function hasDependency(dependencies = {}, packageName) {
  return Object.prototype.hasOwnProperty.call(dependencies, packageName);
}

function collectOverrideReferences(overrides = {}) {
  return Object.entries(overrides).flatMap(([packageName, override]) => [
    packageName,
    typeof override === 'string' ? override : undefined,
    ...(override && typeof override === 'object' ? collectOverrideReferences(override) : []),
  ]);
}

function isCslPackageName(value) {
  return typeof value === 'string' && CSL_PACKAGE_NAME.test(value);
}

function isCslPackageReference(value) {
  return typeof value === 'string' && (isCslPackageName(value) || CSL_PACKAGE_SPECIFIER.test(value));
}

function isCslPackagePath(packagePath) {
  return packagePath
    .split('node_modules/')
    .filter(Boolean)
    .some((packageName) => isCslPackageName(packageName));
}

test('detects CSL package variants and npm aliases', () => {
  assert.equal(isCslPackageReference('@emurgo/cardano-serialization-lib-asmjs'), true);
  assert.equal(
    isCslPackageReference('npm:@emurgo/cardano-serialization-lib-browser@13.2.1'),
    true
  );
  assert.equal(
    CSL_TARBALL_URL.test(
      'https://registry.npmjs.org/@emurgo/cardano-serialization-lib-browser/-/cardano-serialization-lib-browser-13.2.1.tgz'
    ),
    true
  );
});

test('does not declare CSL directly', () => {
  const declared = [
    ...dependencyReferences(packageJson.dependencies),
    ...dependencyReferences(packageJson.devDependencies),
    ...dependencyReferences(packageJson.peerDependencies),
    ...dependencyReferences(packageJson.optionalDependencies),
  ];

  assert.deepEqual(
    declared.filter(isCslPackageReference),
    []
  );
});

test('does not alias CSL through package-manager overrides', () => {
  const overrideReferences = [
    ...collectOverrideReferences(packageJson.overrides),
    ...collectOverrideReferences(packageJson.resolutions),
  ];

  assert.deepEqual(
    overrideReferences.filter(isCslPackageReference),
    []
  );
});

test('keeps CML audit packages pinned and dev-only', () => {
  for (const packageName of CML_PACKAGE_NAMES) {
    assert.equal(hasDependency(packageJson.dependencies, packageName), false);
    assert.equal(hasDependency(packageJson.peerDependencies, packageName), false);
    assert.equal(hasDependency(packageJson.optionalDependencies, packageName), false);

    const declaredVersion = packageJson.devDependencies?.[packageName];
    assert.match(declaredVersion, EXACT_VERSION, `${packageName} must use an exact version`);
    assert.equal(packageLock.packages?.['']?.devDependencies?.[packageName], declaredVersion);

    const lockedPackage = packageLock.packages?.[`node_modules/${packageName}`];
    assert.equal(lockedPackage?.version, declaredVersion);
    assert.equal(lockedPackage?.dev, true);
  }
});

test('keeps lockfile CSL references isolated to the known coin-selection dependency', () => {
  const packages = packageLock.packages || {};
  const allowedCslEntries = new Set(
    allowedDependentPaths.flatMap((packagePath) =>
      dependencyNames(packages[packagePath]?.dependencies)
        .filter(isCslPackageName)
        .map((dependency) => `node_modules/${dependency}`)
    )
  );

  const cslDependents = Object.entries(packages)
    .filter(([, metadata]) =>
      dependencyNames(metadata.dependencies).some(isCslPackageName)
    )
    .map(([packagePath]) => packagePath);

  assert.deepEqual(
    cslDependents.filter((packagePath) => !allowedDependentPaths.includes(packagePath)),
    []
  );

  const cslEntries = Object.keys(packages).filter(isCslPackagePath);

  assert.deepEqual(
    cslEntries.filter((packagePath) => !allowedCslEntries.has(packagePath)),
    []
  );

  const cslTarballs = Object.entries(packages)
    .filter(([, metadata]) => CSL_TARBALL_URL.test(metadata.resolved || ''))
    .map(([packagePath]) => packagePath);

  assert.deepEqual(
    cslTarballs.filter((packagePath) => !allowedCslEntries.has(packagePath)),
    []
  );
});
