const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function copyPublicPackageFile(packageRoot, filePath) {
  const destination = path.join(packageRoot, filePath);

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, filePath), destination);
}

function writeTrezorStub(consumerRoot) {
  const stubRoot = path.join(consumerRoot, 'node_modules', '@trezor', 'connect-web');

  fs.mkdirSync(stubRoot, { recursive: true });
  fs.writeFileSync(
    path.join(stubRoot, 'package.json'),
    JSON.stringify({
      name: '@trezor/connect-web',
      version: '0.0.0-test',
      main: 'index.js',
    })
  );
  fs.writeFileSync(
    path.join(stubRoot, 'index.js'),
    `
const connect = {
  init: async (params) => ({ success: true, payload: { method: 'init', params } }),
  manifest: () => {},
  on: () => {},
  off: () => {},
  dispose: () => {},
  cardanoGetPublicKey: async (params) => ({
    success: true,
    payload: { method: 'cardanoGetPublicKey', params },
  }),
  cardanoSignTransaction: async (params) => ({
    success: true,
    payload: { method: 'cardanoSignTransaction', params },
  }),
  cardanoGetAddress: async (params) => ({
    success: true,
    payload: { method: 'cardanoGetAddress', params },
  }),
  cardanoSignMessage: async (params) => ({
    success: true,
    payload: { method: 'cardanoSignMessage', params },
  }),
};

module.exports = {
  __esModule: true,
  default: connect,
  UI_EVENT: { type: 'ui-event' },
  DEVICE_EVENT: { type: 'device-event' },
};
`
  );
}

test('package metadata points consumers at the generated entrypoints', () => {
  assert.equal(packageJson.main, 'index.js');
  assert.equal(packageJson.types, 'index.d.ts');
  assert.deepEqual(packageJson.files, ['index.js', 'index.d.ts', 'index.js.flow', 'README.md']);
});

test('package tarball only includes the public consumption surface', () => {
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trezor-connect-flow-pack-'));

  try {
    const output = execFileSync(npmCommand(), ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        npm_config_audit: 'false',
        npm_config_cache: cacheDir,
        npm_config_fund: 'false',
      },
    });

    const [pack] = JSON.parse(output);
    const paths = pack.files.map(({ path: filePath }) => filePath).sort();

    assert.deepEqual(paths, ['README.md', 'index.d.ts', 'index.js', 'index.js.flow', 'package.json']);
  } finally {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
});

test('published package surface can be required from a consumer project', () => {
  const consumerRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trezor-connect-flow-consumer-'));
  const packageRoot = path.join(consumerRoot, 'node_modules', packageJson.name);

  try {
    fs.mkdirSync(packageRoot, { recursive: true });
    for (const filePath of [...packageJson.files, 'package.json']) {
      copyPublicPackageFile(packageRoot, filePath);
    }
    writeTrezorStub(consumerRoot);

    execFileSync(
      process.execPath,
      [
        '-e',
        `
const assert = require('node:assert/strict');
const trezorConnectFlow = require(${JSON.stringify(packageJson.name)});

(async () => {
  assert.equal(trezorConnectFlow.CardanoAddressType.REWARD, 14);
  assert.equal(trezorConnectFlow.CardanoTxSigningMode.PLUTUS_TRANSACTION, 3);
  assert.deepEqual(trezorConnectFlow.UI_EVENT, { type: 'ui-event' });
  assert.deepEqual(trezorConnectFlow.DEVICE_EVENT, { type: 'device-event' });
  assert.equal(typeof trezorConnectFlow.default.cardanoGetPublicKey, 'function');

  const request = { path: [2147485500, 2147485463, 2147483648], showOnTrezor: false };
  const response = await trezorConnectFlow.default.cardanoGetPublicKey(request);

  assert.deepEqual(response, {
    success: true,
    payload: {
      method: 'cardanoGetPublicKey',
      params: request,
    },
  });
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
`,
      ],
      {
        cwd: consumerRoot,
        stdio: 'pipe',
      }
    );
  } finally {
    fs.rmSync(consumerRoot, { recursive: true, force: true });
  }
});
