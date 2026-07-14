const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const coinSelectionRoot = path.join(
  root,
  'node_modules',
  '@fivebinaries',
  'coin-selection',
  'lib',
  'cjs'
);

const expectedUnsupportedCmlSurface = [
  'AssetName.new',
  'Assets',
  'BigNum',
  'Bip32PublicKey.from_bytes',
  'BootstrapWitnesses',
  'ByronAddress.icarus_from_key',
  'Certificate.new_vote_delegation',
  'Certificates',
  'Credential.from_keyhash',
  'DRep.from_bech32',
  'DRep.new_key_hash',
  'DRep.new_script_hash',
  'DataCost',
  'Ed25519KeyHash.from_bytes',
  'Ed25519Signature.from_bytes',
  'FixedTransaction',
  'NetworkInfo.testnet_preprod',
  'NetworkInfo.testnet_preview',
  'ScriptHash.from_bytes',
  'TransactionBody.from_bytes',
  'TransactionHash.from_bytes',
  'Value.new_from_assets',
  'Vkey',
  'Vkeywitnesses',
  'VoteDelegation',
  'Withdrawals',
  'min_ada_for_output',
].sort();

function jsFilesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return jsFilesUnder(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.js') ? [entryPath] : [];
  });
}

function collectCoinSelectionCslSurface() {
  const surface = new Map();

  for (const filePath of jsFilesUnder(coinSelectionRoot)) {
    const source = fs.readFileSync(filePath, 'utf8');

    for (const match of source.matchAll(/CardanoWasm\.([A-Za-z0-9_]+)(?:\.([A-Za-z0-9_]+))?/g)) {
      const [, exportedName, methodName] = match;

      if (!surface.has(exportedName)) {
        surface.set(exportedName, new Set());
      }

      if (methodName) {
        surface.get(exportedName).add(methodName);
      }
    }
  }

  return surface;
}

function collectUnsupportedCmlSurface(cslSurface, cml) {
  const unsupported = [];

  for (const [exportedName, methods] of cslSurface) {
    const cmlExport = cml[exportedName];

    if (!cmlExport) {
      unsupported.push(exportedName);
      continue;
    }

    for (const methodName of methods) {
      if (!(methodName in cmlExport)) {
        unsupported.push(`${exportedName}.${methodName}`);
      }
    }
  }

  return unsupported.sort();
}

test('documents the CML 6.2.0 gaps for the current coin-selection CSL surface', () => {
  const cml = require('@dcspark/cardano-multiplatform-lib-nodejs');
  const cslSurface = collectCoinSelectionCslSurface();

  assert.deepEqual(collectUnsupportedCmlSurface(cslSurface, cml), expectedUnsupportedCmlSurface);
});
