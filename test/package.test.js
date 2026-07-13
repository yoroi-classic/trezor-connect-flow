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
