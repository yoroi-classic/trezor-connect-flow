import OriginalTrezorConnect  from '@trezor/connect-web';
import { PROTO } from '@trezor/connect/lib/constants/';
export { UI_EVENT, DEVICE_EVENT } from '@trezor/connect-web';

type ValueOf<T> = T[keyof T];

export type Manifest = {
  appName: string;
  appUrl: string;
  email: string;
};

export type UiEvent = any;
export type DeviceEvent = any;

type HDNodeType = {
    depth: number;
    fingerprint: number;
    child_num: number;
    chain_code: string;
    private_key?: string;
    public_key: string;
};
export type CardanoPublicKey = {
  node: HDNodeType;
  publicKey: string;
  path: number[];
  serializedPath: string;
}
export type Unsuccessful = {
  success: false;
  payload: {
    error: string;
    code?: string;
  };
}
export type Success<T> = {
  success: true;
  payload: T;
}
export type Response<T> = Promise<Success<T> | Unsuccessful>;

type CardanoTxSigningMode = 0 | 1 | 2 | 3;
export const CardanoTxSigningMode: { [key: string]: CardanoTxSigningMode } = {
  ORDINARY_TRANSACTION: 0,
  POOL_REGISTRATION_AS_OWNER: 1,
  MULTISIG_TRANSACTION: 2,
  PLUTUS_TRANSACTION: 3
} as const;
export type CardanoSignTransaction = {
  inputs: CardanoInput[];
  outputs: CardanoOutput[];
  fee: string;
  ttl?: string;
  certificates?: CardanoCertificate[];
  withdrawals?: CardanoWithdrawal[];
  validityIntervalStart?: string;
  auxiliaryData?: CardanoAuxiliaryData;
  mint?: CardanoMint;
  scriptDataHash?: string;
  collateralInputs?: CardanoCollateralInput[];
  requiredSigners?: CardanoRequiredSigner[];
  collateralReturn?: CardanoOutput;
  totalCollateral?: string;
  referenceInputs?: CardanoReferenceInput[];
  additionalWitnessRequests?: (string | number[])[];
  protocolMagic: number;
  networkId: number;
  signingMode: CardanoTxSigningMode;
  derivationType?: CardanoDerivationType;
  includeNetworkId?: boolean;
  tagCborSets?: boolean;
}

export type CardanoInput = {
  path?: string | number[];
  prev_hash: string;
  prev_index: number;
}
export type CardanoToken = {
  assetNameBytes: string;
  amount?: string;
  mintAmount?: string;
}
export type CardanoAssetGroup = {
  policyId: string;
  tokenAmounts: CardanoToken[];
}
export type CardanoCertificatePointer = {
  blockIndex: number;
  txIndex: number;
  certificateIndex: number;
}
type CardanoAddressType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 14 | 15;
export const CardanoAddressType: { [key: string]: CardanoAddressType } = {
  BASE: 0,
  BASE_SCRIPT_KEY: 1,
  BASE_KEY_SCRIPT: 2,
  BASE_SCRIPT_SCRIPT: 3,
  POINTER: 4,
  POINTER_SCRIPT: 5,
  ENTERPRISE: 6,
  ENTERPRISE_SCRIPT: 7,
  BYRON: 8,
  REWARD: 14,
  REWARD_SCRIPT: 15
} as const;
export type CardanoAddressParameters = {
  addressType: CardanoAddressType;
  path?: string | number[];
  stakingPath?: string | number[];
  stakingKeyHash?: string;
  certificatePointer?: CardanoCertificatePointer;
  paymentScriptHash?: string;
  stakingScriptHash?: string;
}
type CardanoDerivationType = 0 | 1 | 2;
export const CardanoDerivationType: { [key: string]: CardanoDerivationType } = {
  LEDGER: 0,
  ICARUS: 1,
  ICARUS_TREZOR: 2
} as const;
type CardanoTxOutputSerializationFormat = 0 | 1;
export const CardanoTxOutputSerializationFormat: {
  [key: string]: CardanoTxOutputSerializationFormat
} = {
  ARRAY_LEGACY: 0,
  MAP_BABBAGE: 1
} as const;
export type CardanoOutput = {
  addressParameters: CardanoAddressParameters,
  amount: string,
  tokenBundle?: CardanoAssetGroup[],
  datumHash?: string,
  format?: CardanoTxOutputSerializationFormat,
  inlineDatum?: string,
  referenceScript?: string,
} | {
  address: string,
  amount: string,
  tokenBundle?: CardanoAssetGroup[],
  datumHash?: string,
  format?: CardanoTxOutputSerializationFormat,
  inlineDatum?: string,
  referenceScript?: string,
};

export const CardanoCertificateType = {
  STAKE_REGISTRATION: 0,
  STAKE_DEREGISTRATION: 1,
  STAKE_DELEGATION: 2,
  STAKE_POOL_REGISTRATION: 3,
  STAKE_REGISTRATION_CONWAY: 7,
  STAKE_DEREGISTRATION_CONWAY: 8,
  VOTE_DELEGATION: 9,
} as const;
export type CardanoCertificate = {
  type: ValueOf<typeof CardanoCertificateType>;
  path?: string | number[];
  pool?: string;
  poolParameters?: CardanoPoolParameters;
  scriptHash?: string;
  keyHash?: string;
  deposit?: string;
  dRep?: CardanoDRep;
};
export const CardanoDRepType = {
  KEY_HASH: 0,
  SCRIPT_HASH: 1,
  ABSTAIN: 2,
  NO_CONFIDENCE: 3,
} as const;
export type CardanoDRep = {
  type: ValueOf<typeof CardanoDRepType>,
  keyHash?: string,
  scriptHash?: string,
};
export type CardanoPoolParameters = {
  poolId: string;
  vrfKeyHash: string;
  pledge: string;
  cost: string;
  margin: CardanoPoolMargin;
  rewardAccount: string;
  owners: CardanoPoolOwner[];
  relays: CardanoPoolRelay[];
  metadata: CardanoPoolMetadata;
}
export type CardanoPoolOwner = {
  stakingKeyPath?: string | number[];
  stakingKeyHash?: string;
}

type CardanoPoolRelayType = 0 | 1 | 2;
export const CardanoPoolRelayType: { [key: string]: CardanoPoolRelayType } = {
  SINGLE_HOST_IP: 0,
  SINGLE_HOST_NAME: 1,
  MULTIPLE_HOST_NAME: 2
} as const;
export type CardanoPoolRelay = {
  type: CardanoPoolRelayType;
  ipv4Address?: string;
  ipv6Address?: string;
  port?: number;
  hostName?: string;
}
export type CardanoPoolMetadata = {
  url: string;
  hash: string;
}
export type CardanoPoolMargin = {
  numerator: string;
  denominator: string;
}
export type CardanoWithdrawal = {
  path?: string | number[];
  amount: string;
  scriptHash?: string;
  keyHash?: string;
}
export type CardanoGovernanceRegistrationDelegation = {
  votePublicKey: string;
  weight: number;
}
type CardanoGovernanceRegistrationFormat = 0 | 1;
export const CardanoGovernanceRegistrationFormat: {
  [key: string]: CardanoGovernanceRegistrationFormat
} = {
  CIP15: 0,
  CIP36: 1
} as const;
export type CardanoGovernanceRegistrationParameters = {
  votePublicKey?: string;
  stakingPath: string | number[];
  paymentAddressParameters: CardanoAddressParameters;
  nonce: string;
  format?: CardanoGovernanceRegistrationFormat;
  delegations?: CardanoGovernanceRegistrationDelegation[];
  votingPurpose?: number;
}
export type CardanoAuxiliaryData = {
  hash?: string;
  cVoteRegistrationParameters?: CardanoGovernanceRegistrationParameters;
}
export type CardanoMint = CardanoAssetGroup[];
export type CardanoCollateralInput = {
  path?: string | number[];
  prev_hash: string;
  prev_index: number;
}
export type CardanoRequiredSigner = {
  keyPath?: string | number[];
  keyHash?: string;
}
export type CardanoReferenceInput = {
  prev_hash: string;
  prev_index: number;
}
export type CardanoTxWitnessType = 0 | 1;
export const CardanoTxWitnessType: { [key: string]: CardanoTxWitnessType } = {
  BYRON_WITNESS: 0,
  SHELLEY_WITNESS: 1
} as const;
export type CardanoSignedTxWitness = {
    type: CardanoTxWitnessType;
    pubKey: string;
    signature: string;
    chainCode?: string;
}
export type CardanoTxAuxiliaryDataSupplementType = 0 | 1;
export const CardanoTxAuxiliaryDataSupplementType: {
  [key: string]: CardanoTxAuxiliaryDataSupplementType
} = {
  NONE: 0,
  GOVERNANCE_REGISTRATION_SIGNATURE: 1
} as const;
export type CardanoAuxiliaryDataSupplement = {
    type: CardanoTxAuxiliaryDataSupplementType;
    auxiliaryDataHash: string;
    governanceSignature?: string;
}

export type CardanoSignedTxData = {
    hash: string;
    witnesses: CardanoSignedTxWitness[];
    auxiliaryDataSupplement?: CardanoAuxiliaryDataSupplement;
}

export type CommonParams = {
    device?: {
      // not passing the `path` property because it's a branded string type
      //path: string;
      state?: string;
      instance?: number;
    };
    useEmptyPassphrase?: boolean;
    useEventListener?: boolean;
    allowSeedlessDevice?: boolean;
    keepSession?: boolean;
    override?: boolean;
    skipFinalReload?: boolean;
    useCardanoDerivation?: boolean;
}

export type Params<T> = CommonParams & T & {
    bundle?: undefined;
}

export type CardanoGetAddress = {
    addressParameters: CardanoAddressParameters;
    protocolMagic: number;
    networkId: number;
    address?: string;
    showOnTrezor?: boolean;
    derivationType?: CardanoDerivationType;
}
export type CardanoAddress = {
    addressParameters: CardanoAddressParameters;
    protocolMagic: number;
    networkId: number;
    serializedPath: string;
    serializedStakingPath: string;
    address: string;
}

export type CardanoSignMessage = {
  path: string | number[];
  payload: string;
  preferHexDisplay: boolean;
  networkId?: number;
  protocolMagic?: number;
  addressParameters?: CardanoAddressParameters
  derivationType: CardanoDerivationType
}

export type CardanoSignMessageResponse = {
  payload: string;
  signature: string;
  headers: {
    protected: {
      1: -8;
      address: string;
    };
    unprotected: {
      version: number;
      hashed: boolean;
    };
  };
  pubKey: string;
}

export default class TrezorConnect {
  static async init({ manifest }: {manifest: Manifest}): Promise<void> {
    return OriginalTrezorConnect.init({ manifest });
  }

  static manifest(manifest: Manifest) {
    OriginalTrezorConnect.manifest(manifest);
  }

  static on(event: any, callback: (_: any) => void): void {
    OriginalTrezorConnect.on(event, callback);
  }

  static off(event: any, callback: (_: any) => void): void {
    OriginalTrezorConnect.off(event, callback);
  }

  static dispose(): void {
    OriginalTrezorConnect.dispose();
  }

  static cardanoGetPublicKey(
    { path, showOnTrezor } : { path: number[], showOnTrezor: boolean }
  ): Response<CardanoPublicKey> {
    return OriginalTrezorConnect.cardanoGetPublicKey({ path, showOnTrezor });
  }

  static cardanoSignTransaction(
    params: Params<CardanoSignTransaction>
  ): Response<CardanoSignedTxData> {
    return OriginalTrezorConnect.cardanoSignTransaction(params);
  }

  static cardanoGetAddress(params: Params<CardanoGetAddress>): Response<CardanoAddress> {
    return OriginalTrezorConnect.cardanoGetAddress(params);
  }

  static cardanoSignMessage(params: Params<CardanoSignMessage>): Response<CardanoSignMessageResponse> {
    return OriginalTrezorConnect.cardanoSignMessage(params);
  }
};
