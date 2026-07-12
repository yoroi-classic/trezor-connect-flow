const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');

const entrypointPath = path.resolve(__dirname, '..', 'index.js');

function createMethod(name, calls, result) {
  return async (params) => {
    calls.push({ name, params });
    return result;
  };
}

function loadEntrypoint({ methods = {}, uiEvent = 'UI_EVENT', deviceEvent = 'DEVICE_EVENT' } = {}) {
  const calls = [];
  const trezorConnect = {
    init: createMethod('init', calls, methods.init),
    manifest: (params) => calls.push({ name: 'manifest', params }),
    on: (event, callback) => calls.push({ name: 'on', event, callback }),
    off: (event, callback) => calls.push({ name: 'off', event, callback }),
    dispose: () => calls.push({ name: 'dispose' }),
    cardanoGetPublicKey: createMethod('cardanoGetPublicKey', calls, methods.cardanoGetPublicKey),
    cardanoSignTransaction: createMethod('cardanoSignTransaction', calls, methods.cardanoSignTransaction),
    cardanoGetAddress: createMethod('cardanoGetAddress', calls, methods.cardanoGetAddress),
    cardanoSignMessage: createMethod('cardanoSignMessage', calls, methods.cardanoSignMessage),
  };
  const trezorModule = {
    __esModule: true,
    default: trezorConnect,
    UI_EVENT: uiEvent,
    DEVICE_EVENT: deviceEvent,
  };
  const originalLoad = Module._load;

  delete require.cache[entrypointPath];
  Module._load = function loadWithTrezorStub(request, parent, isMain) {
    if (request === '@trezor/connect-web') {
      return trezorModule;
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    return {
      calls,
      entrypoint: require(entrypointPath),
    };
  } finally {
    Module._load = originalLoad;
  }
}

test('exports the Cardano constants Yoroi uses', () => {
  const { entrypoint } = loadEntrypoint();

  assert.equal(entrypoint.CardanoTxSigningMode.ORDINARY_TRANSACTION, 0);
  assert.equal(entrypoint.CardanoTxSigningMode.PLUTUS_TRANSACTION, 3);
  assert.equal(entrypoint.CardanoAddressType.BASE, 0);
  assert.equal(entrypoint.CardanoAddressType.REWARD, 14);
  assert.equal(entrypoint.CardanoDerivationType.ICARUS_TREZOR, 2);
  assert.equal(entrypoint.CardanoTxOutputSerializationFormat.MAP_BABBAGE, 1);
  assert.equal(entrypoint.CardanoCertificateType.VOTE_DELEGATION, 9);
  assert.equal(entrypoint.CardanoDRepType.NO_CONFIDENCE, 3);
  assert.equal(entrypoint.CardanoTxWitnessType.SHELLEY_WITNESS, 1);
  assert.equal(entrypoint.CardanoTxAuxiliaryDataSupplementType.GOVERNANCE_REGISTRATION_SIGNATURE, 1);
});

test('forwards lifecycle calls and re-exports device/UI events', async () => {
  const manifest = {
    appName: 'Yoroi',
    appUrl: 'https://wallet.blinklabs.cloud',
    email: 'support@blinklabs.cloud',
  };
  const callback = () => {};
  const { calls, entrypoint } = loadEntrypoint({
    uiEvent: { type: 'ui-request-button' },
    deviceEvent: { type: 'device-connect' },
  });

  assert.deepEqual(entrypoint.UI_EVENT, { type: 'ui-request-button' });
  assert.deepEqual(entrypoint.DEVICE_EVENT, { type: 'device-connect' });

  await entrypoint.default.init({ manifest });
  entrypoint.default.manifest(manifest);
  entrypoint.default.on(entrypoint.UI_EVENT, callback);
  entrypoint.default.off(entrypoint.UI_EVENT, callback);
  entrypoint.default.dispose();

  assert.deepEqual(calls, [
    { name: 'init', params: { manifest } },
    { name: 'manifest', params: manifest },
    { name: 'on', event: entrypoint.UI_EVENT, callback },
    { name: 'off', event: entrypoint.UI_EVENT, callback },
    { name: 'dispose' },
  ]);
});

test('cardanoGetPublicKey preserves the request and successful response shapes', async () => {
  const response = {
    success: true,
    payload: {
      node: {
        depth: 5,
        fingerprint: 1234567890,
        child_num: 2147485500,
        chain_code: 'a'.repeat(64),
        public_key: 'b'.repeat(66),
      },
      publicKey: 'c'.repeat(66),
      path: [2147485500, 2147485463, 2147483648],
      serializedPath: "m/1852'/1815'/0'",
    },
  };
  const request = {
    path: [2147485500, 2147485463, 2147483648],
    showOnTrezor: true,
  };
  const { calls, entrypoint } = loadEntrypoint({
    methods: { cardanoGetPublicKey: response },
  });

  const result = await entrypoint.default.cardanoGetPublicKey(request);

  assert.strictEqual(result, response);
  assert.deepEqual(calls, [{ name: 'cardanoGetPublicKey', params: request }]);
});

test('cardanoSignTransaction forwards a Yoroi transaction fixture unchanged', async () => {
  const { calls, entrypoint } = loadEntrypoint({
    methods: {
      cardanoSignTransaction: {
        success: true,
        payload: {
          hash: '1'.repeat(64),
          witnesses: [
            {
              type: 1,
              pubKey: '2'.repeat(64),
              signature: '3'.repeat(128),
              chainCode: '4'.repeat(64),
            },
          ],
          auxiliaryDataSupplement: {
            type: 1,
            auxiliaryDataHash: '5'.repeat(64),
            governanceSignature: '6'.repeat(128),
          },
        },
      },
    },
  });
  const request = {
    inputs: [
      {
        path: "m/1852'/1815'/0'/0/0",
        prev_hash: '7'.repeat(64),
        prev_index: 0,
      },
    ],
    outputs: [
      {
        addressParameters: {
          addressType: entrypoint.CardanoAddressType.BASE,
          path: [2147485500, 2147485463, 2147483648, 0, 1],
          stakingPath: [2147485500, 2147485463, 2147483648, 2, 0],
        },
        amount: '3000000',
        tokenBundle: [
          {
            policyId: '8'.repeat(56),
            tokenAmounts: [{ assetNameBytes: '546573744173736574', amount: '42' }],
          },
        ],
        format: entrypoint.CardanoTxOutputSerializationFormat.MAP_BABBAGE,
        inlineDatum: 'd87980',
        referenceScript: '820182018282051a075bcd15',
      },
      {
        address: 'addr_test1vqpz...',
        amount: '1000000',
        datumHash: '9'.repeat(64),
      },
    ],
    fee: '170000',
    ttl: '50000000',
    certificates: [
      {
        type: entrypoint.CardanoCertificateType.VOTE_DELEGATION,
        path: [2147485500, 2147485463, 2147483648, 2, 0],
        dRep: {
          type: entrypoint.CardanoDRepType.KEY_HASH,
          keyHash: 'a'.repeat(56),
        },
      },
    ],
    withdrawals: [
      {
        path: [2147485500, 2147485463, 2147483648, 2, 0],
        amount: '1200000',
      },
    ],
    validityIntervalStart: '49900000',
    auxiliaryData: {
      cVoteRegistrationParameters: {
        stakingPath: [2147485500, 2147485463, 2147483648, 2, 0],
        paymentAddressParameters: {
          addressType: entrypoint.CardanoAddressType.BASE,
          path: [2147485500, 2147485463, 2147483648, 0, 0],
          stakingPath: [2147485500, 2147485463, 2147483648, 2, 0],
        },
        nonce: '123456',
        format: entrypoint.CardanoGovernanceRegistrationFormat.CIP36,
        delegations: [{ votePublicKey: 'b'.repeat(64), weight: 1 }],
        votingPurpose: 0,
      },
    },
    mint: [
      {
        policyId: 'c'.repeat(56),
        tokenAmounts: [{ assetNameBytes: '4d696e744d65', mintAmount: '1' }],
      },
    ],
    scriptDataHash: 'd'.repeat(64),
    collateralInputs: [{ prev_hash: 'e'.repeat(64), prev_index: 1 }],
    requiredSigners: [{ keyPath: [2147485500, 2147485463, 2147483648, 0, 2] }],
    collateralReturn: {
      address: 'addr_test1vqpz...',
      amount: '1500000',
      format: entrypoint.CardanoTxOutputSerializationFormat.MAP_BABBAGE,
    },
    totalCollateral: '5000000',
    referenceInputs: [{ prev_hash: 'f'.repeat(64), prev_index: 2 }],
    additionalWitnessRequests: [
      [2147485500, 2147485463, 2147483648, 0, 3],
      "m/1852'/1815'/0'/0/4",
    ],
    protocolMagic: 1097911063,
    networkId: 0,
    signingMode: entrypoint.CardanoTxSigningMode.PLUTUS_TRANSACTION,
    derivationType: entrypoint.CardanoDerivationType.ICARUS_TREZOR,
    includeNetworkId: true,
    tagCborSets: true,
    useEventListener: true,
    keepSession: true,
  };

  const result = await entrypoint.default.cardanoSignTransaction(request);

  assert.equal(result.success, true);
  assert.equal(result.payload.witnesses[0].type, entrypoint.CardanoTxWitnessType.SHELLEY_WITNESS);
  assert.equal(
    result.payload.auxiliaryDataSupplement.type,
    entrypoint.CardanoTxAuxiliaryDataSupplementType.GOVERNANCE_REGISTRATION_SIGNATURE
  );
  assert.deepEqual(calls, [{ name: 'cardanoSignTransaction', params: request }]);
});

test('cardanoGetAddress and cardanoSignMessage preserve unsuccessful responses', async () => {
  const addressError = {
    success: false,
    payload: { error: 'User rejected address export', code: 'Failure_ActionCancelled' },
  };
  const messageError = {
    success: false,
    payload: { error: 'Device disconnected during signing', code: 'Device_Disconnected' },
  };
  const { calls, entrypoint } = loadEntrypoint({
    methods: {
      cardanoGetAddress: addressError,
      cardanoSignMessage: messageError,
    },
  });
  const addressRequest = {
    addressParameters: {
      addressType: entrypoint.CardanoAddressType.BASE,
      path: [2147485500, 2147485463, 2147483648, 0, 0],
      stakingPath: [2147485500, 2147485463, 2147483648, 2, 0],
    },
    protocolMagic: 1097911063,
    networkId: 0,
    derivationType: entrypoint.CardanoDerivationType.ICARUS_TREZOR,
    showOnTrezor: false,
  };
  const messageRequest = {
    path: [2147485500, 2147485463, 2147483648, 0, 0],
    payload: '48656c6c6f20596f726f69',
    preferHexDisplay: true,
    networkId: 0,
    protocolMagic: 1097911063,
    addressParameters: addressRequest.addressParameters,
    derivationType: entrypoint.CardanoDerivationType.ICARUS_TREZOR,
  };

  assert.strictEqual(await entrypoint.default.cardanoGetAddress(addressRequest), addressError);
  assert.strictEqual(await entrypoint.default.cardanoSignMessage(messageRequest), messageError);
  assert.deepEqual(calls, [
    { name: 'cardanoGetAddress', params: addressRequest },
    { name: 'cardanoSignMessage', params: messageRequest },
  ]);
});
